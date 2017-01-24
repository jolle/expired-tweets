require('colors');
const Args = require('yargs').argv;
const Whois = require('node-whois');
const WhoisParser = require('parse-whois');
// TODO: const Axios = require('axios');
const fs = require('fs');
const Path = require('path');
const SafeEval = require('safe-eval');
const Domain = require('parse-domain');

if (Args.help || Args.h) {
    console.log('expired-tweets'.blue + ' – get links from a Twitter user with claimable or expired tweets.\n\n\t-d|--dir=[directory]\t\tThe location of the Twitter archive\n\n\t-h|--help\t\t\t\tGet argument list (this)\n\n\t-v|--verbose\t\t\t\tVerbose mode on-i|--status-interval=[interval]\t\tInterval how often status notification should be executed\n\n' + 'note!'.bold.underline + ' the author(s), maker(s) or contributor(s) of this program is/are not reponsible for any actions made because of this application.');
} else {
    console.log('expired-tweets'.blue.bold);
    if (!Args.d && !Args.dir) {
        console.log(`${'arguments'.bold.red} you didn't give the argument dir or d.`);
    } else {
        const foundDomains = []; // stores found domains
        const checkedDomains = []; // stores whois checked domains
        const claimableDomains = []; // stores claimable/expired domains
        /*
        TODO:
        const claimableWebsiteFingerprints = { // from: https://github.com/nahamsec/HostileSubBruteforcer/blob/master/PerlHostileSubBruteforcer/HostileBruteForceScanner.pl#L48-L54
            'Heroku': 'there is no app configured at that hostname',
            'AWS': 'NoSuchBucket',
            'Squarespace': 'No Such Account',
            'GitHub': 'here isn\'t a GitHub Pages site here',
            'Shopify': 'Sorry, this shop is currently unavailable',
            'Tumblr': 'There\'s nothing here.',
            'WpEngine': 'The site you were looking for couldn\'t be found',
        };
        */

        const directory = Args.d || Args.dir; // directory
        const tweetsDirectory = directory.indexOf('data/js/tweets') > -1 ? directory : Path.join(directory, 'data/js/tweets/'); // js data tweets dir

        const statusInterval = setInterval(() => {
            console.log(`${'status'.bold.blue} ${foundDomains.length} domain(s) found, ${checkedDomains.length} domains(s) checked, ${claimableDomains.length} domain(s) claimable, ${tweetCount} tweet(s) fetched`);
        }, (Args.statusInterval || Args.i || 2) * 60 * 1000);

        const whoisLookup = (domain, retry) => { // whois lookup function
            return new Promise((fulfill, reject) => {
                Whois.lookup(domain, (whoisError, data) => {
                    checkedDomains.push(domain);

                    if (whoisError) {
                        if (!retry) {
                            setTimeout(() => {
                                fulfill(whoisLookup(domain, true));
                            }, 10 * 1000);
                        } else {
                            reject(`${'whois'.bold.red} failed whois on ${domain}`);
                        }
                    } else {
                        const whoisData = WhoisParser.parseWhoIsData(data);

                        whoisData.forEach((part) => {
                            if (part.attribute === 'Registrar Registration Expiration Date' || part.attribute.startsWith('Expiry')) {
                                if (Args.v || Args.verbose) console.log(`${'whois'.bold.gray} ${domain} expires at ${part.value}`);

                                const expiresIn = new Date(part.value) - Date.now();

                                if (expiresIn < 0) {
                                    fulfill(`${'whois'.bold.yellow.bgRed} ${domain} expired ${Math.abs(Math.round(expiresIn / 1000 / 60 / 60 / 24))} days ago!`);
                                    claimableDomains.push(domain);
                                } else if (expiresIn < 1000 * 60 * 60 * 24 * 3) { // if expiry in under 3 days
                                    fulfill(`${'whois'.bold.yellow} ${domain} expires in ${Math.round(expiresIn / 1000 / 60 / 60 / 24)} days at ${part.value}.`);
                                    claimableDomains.push(domain);
                                }
                            }
                        });
                    }
                });
            });
        };

        fs.readdir(tweetsDirectory, (dirError, files) => {
            if (dirError) {
                console.log(`${'readdir'.bold.red} An error occured when trying to get files in given directory:`, dirError);
            } else {
                files.forEach((file) => {
                    fs.stat(Path.join(tweetsDirectory, file), (statError, stat) => {
                        if (statError) {
                            console.log(`${'stat'.bold.red} An error occured when trying to get stats of a file:`, statError);
                        } else if (stat.isFile() && Path.basename(file).split('.').slice(-1)[0] === 'js') {
                            fs.readFile(Path.join(tweetsDirectory, file), (readError, data) => {
                                if (readError) {
                                    console.log(`${'readfile'.bold.red} An error occured when trying to read a file:`, statError);
                                } else {
                                    const tweets = SafeEval(`Grailbird={data:{}};${data}`);

                                    if (tweets) {
                                        tweets.data[Object.keys(tweets.data)[0]].forEach((tweet) => {
                                            if (tweet.entities.urls.length > 0) {
                                                tweet.entities.urls.forEach((url) => {
                                                    const domain = Domain(url.expanded_url);
                                                    whoisLookup(`${domain.domain}.${domain.tld}`)
                                                    .then((message) => {
                                                        console.log(message);
                                                    })
                                                    .catch(console.log);
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                });
            }
        });
    }
}

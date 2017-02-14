require('colors');
const ExpiredTweets = require('./index.js');
const args = require('yargs').argv;

if (args.d || args.dir) {
    const tweetScan = new ExpiredTweets({
        dir: args.d || args.dir,
    });
    tweetScan.run();

    tweetScan.on('error', (data) => {
        console.error(`${'error'.red.bold} An error occured`, data);
    });
    tweetScan.on('data', (data) => {
        if (data.type === 'whois') {
            const diff = new Date(data) - new Date();

            if (data.data === -1 || diff < 0) {
                console.log(`${'alert'.red.bgYellow.bold} ${data.domain} expired${data.data === -1 ? ' a while ago' : ` ${diff / 1000 / 60 / 60} hours ago`}`);
            } else if (new Date(data) - new Date() < 1000 * 60 * 60 * 24 * 3) {
                console.log(`${'alert'.red.bold} ${data.domain} will expire in ${diff / 1000 / 60 / 60} hours'}`);
            } else if (args.v || args.verbose) console.log(`${'info'.gray} Checked ${data.domain}`);
        } else if (data.type === 'takeover') {
            console.log(`${'alert'.red.bold} ${data.domain} may be takeoverable with ${data.data === 'warning' ? 'an unknown host' : `host ${data.data}`}`);
        }
    });
}

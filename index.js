const Whois = require('node-whois');
const WhoisParser = require('parse-whois');
const Axios = require('axios');
const fs = require('fs');
const Path = require('path');
const SafeEval = require('safe-eval');
const Domain = require('domain-name-parser');

/**
 * @param {object} options
 */
function app(options) {
    /**
     * @typedef {object} events
     */
    this.events = {};

    /**
     * @description fires a callback defined with function on
     * @param {string} event – event name
     * @param {any} data – data to be passed with callback
     */
    this.fire = (event, data) => {
        if (Object.keys(this.events).indexOf(event) > -1) {
            this.events[event].forEach((callback) => {
                callback(data);
            });
        }
    };

    /**
     * @description stores a callback for firing afterwards
     * @param {string} event – event name
     * @param {function} callback – callback to be called when event is fired
     */
    this.on = (event, callback) => {
        if (Object.keys(this.events).indexOf(event) === -1) {
            this.events[event] = [];
        }

        this.events[event].push(callback);
    };

    /**
     * @description whois lookup
     */
    this.whois = {
        checked: {},

        lookup: (domain, retry) => new Promise((fulfill, reject) => {
            const index = Object.keys(this.whois.checked).map(key => key.toLowerCase())
                            .indexOf(domain.toLowerCase());

            if (index > -1) {
                fulfill(this.whois.checked[Object.keys(this.whois.checked)[index]]);
            } else {
                Whois.lookup(domain, (whoisError, data) => {
                    if (whoisError) {
                        if (!retry) {
                            setTimeout(() => {
                                fulfill(this.whois.lookup(domain, true));
                            }, 10 * 1000);
                        } else {
                            reject(whoisError);
                        }
                    } else if (data.indexOf('No match for "') > -1) {
                        fulfill(-1);
                    } else {
                        const whoisData = WhoisParser.parseWhoIsData(data);

                        if (whoisData.every((part) => {
                            if (part.attribute === 'Registrar Registration Expiration Date' || part.attribute.startsWith('Expir')) {
                                this.checked.push(part);
                                fulfill(part.value);
                                return false;
                            }

                            return true;
                        })) {
                            reject('no expiration date found');
                        }
                    }
                });
            }
        }),
    };

    /**
     * @description takeover logic
     */
    this.takeover = {
        /* eslint-disable quote-props */
        fingerprints: {
            'Heroku': 'there is no app configured at that hostname',
            'AWS': 'NoSuchBucket',
            'Squarespace': 'No Such Account',
            'GitHub': 'here isn\'t a GitHub Pages site here',
            'Shopify': 'Sorry, this shop is currently unavailable',
            'Tumblr': 'There\'s nothing here.',
            'WpEngine': 'The site you were looking for couldn\'t be found',
            'GoDaddy': 'http://mcc.godaddy.com/park/',
        },
        /* eslint-enable quote-props */

        lookup: (url, retry) => new Promise((fulfill, reject) => {
            Axios.get(url.startsWith('http') ? url : `http://${url}`)
                .then(({ data }) => {
                    Object.keys(this.takeover.fingerprints).forEach((host) => {
                        if (data.indexOf(this.takeover.fingerprints[host]) > -1) {
                            fulfill(host, true);
                        }
                    });

                    fulfill(null, false);
                })
                .catch(() => {
                    if (!retry) {
                        setTimeout(() => {
                            fulfill(this.takeover.lookup(url, true));
                        }, 10 * 1000);
                    } else {
                        reject();
                    }
                });
        }),
    };

    /**
     * @description queue class for handling queues
     */
    function Queue() {
        this.queue = [];
        this.endCallbacks = [];

        this.add = () => {
            const token = Math.random().toString(36).substr(2, 10);
            this.queue.push(token);
            return token;
        };

        this.complete = (token) => {
            const index = this.queue.indexOf(token);
            if (index > -1) this.queue.splice(index, 1);
            if (this.queue.length === 0) {
                this.endCallbacks.forEach((callback) => {
                    callback();
                });
            }
        };

        this.on = (event, callback) => {
            if (event === 'end') {
                this.endCallbacks.push(callback);
            }
        };
    }

    /**
     * @description gets all javascript files in a directory
     * @param {string} directory
     */
    this.getFiles = directory => new Promise((fulfill, reject) => {
        fs.readdir(directory, (dirError, files) => {
            if (dirError) {
                reject(dirError);
            } else {
                const jsFiles = [];
                const fileQueue = new Queue();

                files.forEach((file) => {
                    const fileToken = fileQueue.add();
                    fs.stat(Path.join(directory, file), (statError, stat) => {
                        if (statError) {
                            reject(statError);
                        } else if (stat.isFile() && Path.basename(file).split('.').slice(-1)[0] === 'js') {
                            jsFiles.push(Path.join(directory, file));
                        }

                        fileQueue.complete(fileToken);
                    });
                });

                fileQueue.on('end', () => {
                    fulfill(jsFiles);
                });
            }
        });
    });

    /**
     * @description if username is found, fire event only once
     */
    this.calledUsernameFound = false;
    this.usernameFound = (username) => {
        if (!this.calledUsernameFound) {
            this.calledUsernameFound = true;

            this.fire('username', username);
        }
    };

    /**
     * @typedef {array} checked hosts (not domains)
     */
    this.checked = [];

    /**
     * @description run the main logic
     */
    this.run = () => {
        if (!options.dir) {
            this.fire('error', 'no directory given');
        } else {
            const fileQueue = new Queue();

            this.getFiles(options.dir)
                .then((files) => {
                    files.forEach((file) => {
                        fs.readFile(file, 'utf-8', (readError, fileData) => {
                            if (readError) {
                                this.fire('error', readError);
                            } else {
                                const tweetList = (SafeEval(`Grailbird={data:{}};${fileData}`) || { data: false }).data;
                                if (tweetList) {
                                    Object.keys(tweetList).forEach((key) => {
                                        const tweets = tweetList[key];

                                        if (tweets) {
                                            if (tweets[0].user.screen_name) this.usernameFound(tweets[0].user.screen_name);

                                            const hosts = tweets.map(tweet =>
                                                            tweet.entities.urls.map(url =>
                                                                url.expanded_url.replace(/[a-zA-Z0-9]+?:\/\//g, '').split('/')[0].split('@').slice(-1).join('')))
                                                            .reduce((a, b) => a.concat(b));

                                            const fileToken = fileQueue.add();

                                            if (hosts && hosts.length > 0) {
                                                const hostQueue = new Queue();

                                                hostQueue.on('end', () => {
                                                    fileQueue.complete(fileToken);
                                                });

                                                hosts.forEach((host) => {
                                                    if (host) {
                                                        const rootDomain = (Domain(host)
                                                                        || { domainName: false })
                                                                            .domainName;

                                                        const hostToken = hostQueue.add();

                                                        const taskQueue = new Queue();

                                                        const whoisToken = taskQueue.add();
                                                        const takeoverToken = taskQueue.add();

                                                        taskQueue.on('end', () => {
                                                            hostQueue.complete(hostToken);
                                                        });

                                                        this.whois.lookup(rootDomain).catch(() => {
                                                            taskQueue.complete(whoisToken);
                                                        }).then((expiry) => {
                                                            this.fire('data', {
                                                                type: 'whois',
                                                                data: expiry,
                                                                domain: host,
                                                            });

                                                            taskQueue.complete(whoisToken);
                                                        });

                                                        this.takeover.lookup(host).catch(() => {
                                                            this.fire('data', {
                                                                type: 'takeover',
                                                                data: 'warning',
                                                                domain: host,
                                                            });

                                                            taskQueue.complete(takeoverToken);
                                                        }).then((claimHost, claimable) => {
                                                            if (claimable) {
                                                                this.fire('data', {
                                                                    type: 'takeover',
                                                                    data: claimHost,
                                                                    domain: host,
                                                                });
                                                            } else if (claimable === false) {
                                                                this.fire('data', {
                                                                    type: 'takeover',
                                                                    data: false,
                                                                    domain: host,
                                                                });
                                                            }

                                                            taskQueue.complete(takeoverToken);
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    });
                })
                .catch((error) => {
                    this.fire('error', error);
                });
        }
    };
}

module.exports = app;

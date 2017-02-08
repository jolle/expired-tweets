require('colors');
const ExpiredTweets = require('./index.js');
const args = require('yargs').argv;

if (args.d || args.dir) {
    const tweetScan = new ExpiredTweets({
        dir: args.d || args.dir,
    });
    tweetScan.run();

    tweetScan.on('error', (data) => {
        console.error('error incoming:', data);
    });
    tweetScan.on('data', (data) => {
        console.log('data incoming:', data);
    });
}

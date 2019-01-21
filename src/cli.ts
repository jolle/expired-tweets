import { argv } from 'yargs';
import { ArchiveTweetExtractor } from './ArchiveTweetExtractor';
import { ExpiredTweets } from '.';
import { CheckResult, Provider } from './Provider';
import chalk from 'chalk';

if (!argv.directory && !argv.d) {
    console.error('Directory not given');
} else {
    const ext = new ArchiveTweetExtractor((argv.directory || argv.d) as string);
    ext.findDir()
        .then(dir => ext.readTweetScripts(dir))
        .then(tweets => {
            const et = new ExpiredTweets(tweets);
            et.on('result', ({ link, provider, result, tweet }) => {
                if (result.result !== CheckResult.NOTHING) {
                    console.log(
                        `${
                            result.result === CheckResult.ERROR
                                ? chalk.red.bold(result.result.toUpperCase())
                                : chalk.yellow.bold(result.result.toUpperCase())
                        } ${chalk.bold(provider.constructor.name)} ${
                            result.message
                        } (${link}) (${tweet.getTweetLink()})`
                    );
                }
            });
        });
}

import { EventEmitter } from 'events';
import { Tweet } from './Tweet';
import providers from './providers';
import { Provider, CheckResult } from './Provider';

interface IExpiredTweets {
    on(
        event: 'result',
        listener: (
            result: {
                link: string;
                provider: Provider;
                result: { message?: string; result: CheckResult };
                tweet: Tweet;
            }
        ) => void
    ): this;
    on(event: string, listener: Function): this;
}

export class ExpiredTweets extends EventEmitter implements IExpiredTweets {
    constructor(tweets: Tweet[]) {
        super();

        tweets.forEach(tweet =>
            tweet.links.forEach(link =>
                providers.forEach(async provider => {
                    const result = await provider.checkURL(link);
                    this.emit('result', {
                        link,
                        result,
                        tweet,
                        provider
                    });
                })
            )
        );
    }
}

import { Provider, CheckResult } from '../Provider';
import whis from 'whis';
import { URL } from 'url';

const msToHuman = (ms: number) => {
    if (ms < 60 * 1000) return 'in under a minute';
    if (ms < 60 * 60 * 1000) return 'in under an hour';
    if (ms < 24 * 60 * 60 * 1000) return 'today';

    return `in ${Math.ceil(ms / (24 * 60 * 60 * 1000))} days`;
};

export class Whois extends Provider {
    async checkURL(url: string) {
        const data = await whis(
            new URL(url).host
                .split('.')
                .slice(-2)
                .join('.')
        ).catch(error => ({ error } as any));

        if (data.error) {
            console.error(data.error);
            return { result: CheckResult.NOTHING };
        }

        if (!data.exists)
            return {
                result: CheckResult.ERROR,
                message: "The domain of the hostname doesn't exist"
            };

        if (!data.expiration) return { result: CheckResult.NOTHING };

        if (data.expiration < Date.now()) {
            if (data.expiration < Date.now() + 5 * 24 * 60 * 60 * 1000)
                return {
                    result: CheckResult.WARNING,
                    message: `The domain of the hostname is expiring ${msToHuman(
                        Date.now() - data.expiration
                    )}`
                };

            return {
                result: CheckResult.ERROR,
                message: 'The domain of the hostname has expired'
            };
        }

        return { result: CheckResult.NOTHING };
    }
}

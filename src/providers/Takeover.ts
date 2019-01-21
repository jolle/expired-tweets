import { Provider, CheckResult } from '../Provider';
import { identify } from 'takeover';
import { URL } from 'url';

export class Takeover extends Provider {
    async checkURL(url: string) {
        const takeover = await identify(new URL(url).host).catch(() => null);

        if (!takeover) return { result: CheckResult.NOTHING };

        return {
            result: CheckResult.WARNING,
            message: `The hostname might be takeoverable with service ${
                takeover.name
            }`
        };
    }
}

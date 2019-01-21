import { Provider, CheckResult } from '../Provider';
import { resolve as rawResolve } from 'dns';
import { promisify } from 'util';
import { URL } from 'url';

const resolve = promisify(rawResolve);

export class DNS extends Provider {
    async checkURL(url: string) {
        const servers = await resolve(new URL(url).host).catch(() => null);

        return servers && servers.length > 0
            ? { result: CheckResult.NOTHING }
            : {
                  result: CheckResult.WARNING,
                  message: 'There are no DNS servers attached to this hostname'
              };
    }
}

import { Whois } from './../../src/providers/Whois';
import { CheckResult } from '../../src/Provider';

describe('Whois provider', async () => {
    const whois = new Whois();

    it('warns on dropped domains', async () => {
        const result = await whois.checkURL(
            `https://expired.com/some/page/here`
        );

        expect(result).toBe(CheckResult.WARNING);
    });

    it('errors on non-existent domains', async () => {
        const result = await whois.checkURL(
            `https://doesnt-exist.com/some/page/here`
        );

        expect(result).toBe(CheckResult.ERROR);
    });

    it('detects an existing domains', async () => {
        const result = await whois.checkURL(
            `https://exists.com/some/page/here`
        );

        expect(result).toBe(CheckResult.NOTHING);
    });
});

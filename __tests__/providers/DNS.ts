import { DNS } from './../../src/providers/DNS';
import { CheckResult } from '../../src/Provider';

jest.mock('dns');

describe('DNS provider', async () => {
    const dns = new DNS();

    it('warns on non-existent DNS records', async () => {
        const result = await dns.checkURL(
            `https://doesnt-exist.example.com/some/page/here`
        );

        expect(result).toBe(CheckResult.WARNING);
    });

    it('warns on non-existent domains', async () => {
        const result = await dns.checkURL(
            `https://doesnt-exist.com/some/page/here`
        );

        expect(result).toBe(CheckResult.WARNING);
    });

    it('ignores existing DNS records', async () => {
        const result = await dns.checkURL(
            `https://exists.example.com/some/page/here`
        );

        expect(result).toBe(CheckResult.NOTHING);
    });
});

import { Social } from '../../src/providers/Social';
import { CheckResult } from '../../src/Provider';

jest.setTimeout(30 * 1000);

describe('Social provider', () => {
    const social = new Social();

    it.concurrent('detects an available GitHub username', async () => {
        const result = await social.checkURL('https://github.com/available');

        expect(result).toBe(CheckResult.ERROR);
    });

    it.concurrent('detects an unavailable GitHub username', async () => {
        const result = await social.checkURL('https://github.com/unavailable');

        expect(result).toBe(CheckResult.NOTHING);
    });

    it.concurrent(
        'detects when a GitHub URL has a subpath and alerts',
        async () => {
            const result = await social.checkURL(
                'https://github.com/available/some-repo'
            );

            expect(result).toBe(CheckResult.ERROR);
        }
    );

    it.concurrent('detects an available Twitter username', async () => {
        const result = await social.checkURL('https://twitter.com/available');

        expect(result).toBe(CheckResult.ERROR);
    });

    it.concurrent('detects an unavailable Twitter username', async () => {
        const result = await social.checkURL('https://twitter.com/unavailable');

        expect(result).toBe(CheckResult.NOTHING);
    });

    it.concurrent('detects when a Twitter URL has a subpath', async () => {
        const result = await social.checkURL(
            'https://twitter.com/available/12345678'
        );

        expect(result).toBe(CheckResult.NOTHING);
    });

    it.concurrent('detects an available Facebook username', async () => {
        const result = await social.checkURL('https://facebook.com/available');

        expect(result).toBe(CheckResult.ERROR);
    });

    it.concurrent('detects an unavailable Facebook username', async () => {
        const result = await social.checkURL(
            'https://facebook.com/unavailable'
        );

        expect(result).toBe(CheckResult.NOTHING);
    });

    it.concurrent('detects when a Facebook URL has a subpath', async () => {
        const result = await social.checkURL(
            'https://facebook.com/available/12345678'
        );

        expect(result).toBe(CheckResult.NOTHING);
    });

    it.concurrent('detects an available Instagram username', async () => {
        const result = await social.checkURL('https://instagram.com/available');

        expect(result).toBe(CheckResult.ERROR);
    });

    it.concurrent('detects an unavailable Instagram username', async () => {
        const result = await social.checkURL(
            'https://instagram.com/unavailable/'
        );

        expect(result).toBe(CheckResult.NOTHING);
    });

    it.concurrent('detects when a Instagram URL has a subpath', async () => {
        const result = await social.checkURL('https://instagram.com/p/12345');

        expect(result).toBe(CheckResult.NOTHING);
    });
});

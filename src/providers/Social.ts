import { Provider, CheckResult } from '../Provider';
import axios from 'axios';
import { URL } from 'url';

const socials = [
    {
        name: 'GitHub',
        valid: (url: string) =>
            /^(www\.)?github\.com$/.test(new URL(url).host) &&
            url.replace(/\/$/, '').split('/').length >= 4, // you can create repos with the same name, subpages are thus valid
        check: (url: string) =>
            axios
                .get(`https://github.com/${url.split('/')[3]}`)
                .then(() => true)
                .catch(() => false) // 404 when available
    },
    {
        name: 'Twitter',
        valid: (url: string) =>
            /^(www\.)?twitter\.com$/.test(new URL(url).host) &&
            url.replace(/\/$/, '').split('/').length === 4, // you cannot take over subpages, e.g. tweets (IDs increment)
        check: (url: string) =>
            axios
                .get(
                    `https://twitter.com/users/username_available?username=${
                        url.split('/')[3]
                    }`
                )
                .then(({ data }) => !data.valid)
                .catch(() => true)
    },
    {
        name: 'Facebook',
        valid: (url: string) =>
            /^(www\.)?facebook\.com$/.test(new URL(url).host) &&
            url.replace(/\/$/, '').split('/').length === 4,
        check: (url: string) =>
            axios
                .get(`https://www.facebook.com/${url.split('/')[3]}`)
                .then(() => true)
                .catch(() => false)
    },
    {
        name: 'Instagram',
        valid: (url: string) =>
            /^(www\.)?instagram\.com$/.test(new URL(url).host) &&
            url.replace(/\/$/, '').split('/').length === 4,
        check: (url: string) =>
            axios
                .get(`https://www.instagram.com/${url.split('/')[3]}`)
                .then(() => true)
                .catch(() => false)
    }
];

export class Social extends Provider {
    async checkURL(url: string) {
        const social = socials.find(({ valid }) => valid(url));

        if (!social) return { result: CheckResult.NOTHING };

        return (await social.check(url))
            ? { result: CheckResult.NOTHING }
            : {
                  result: CheckResult.ERROR,
                  message:
                      'The username used in this link might be available for registration.'
              };
    }
}

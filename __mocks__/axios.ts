const axios: any = jest.genMockFromModule('axios');

axios.get = (url: string) =>
    new Promise((resolve, reject) => {
        switch (url) {
            case 'https://github.com/available':
                reject(false);
                break;
            case 'https://github.com/unavailable':
                resolve(true);
                break;
            case 'https://twitter.com/users/username_available?username=available':
                resolve({ data: { valid: true } });
                break;
            case 'https://twitter.com/users/username_available?username=unavailable':
                resolve({ data: { valid: false } });
                break;
            case 'https://www.facebook.com/available':
                reject(false);
                break;
            case 'https://www.facebook.com/unavailable':
                resolve(true);
                break;
            case 'https://www.instagram.com/available':
                reject(false);
                break;
            case 'https://www.instagram.com/unavailable':
                resolve(true);
                break;
            default:
                resolve(true);
                break;
        }
    });

module.exports = axios;

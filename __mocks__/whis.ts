const responses: any = {
    'expired.com': {
        expiration: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        exists: true
    },
    'doesnt-exist.com': {
        expiration: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        exists: false
    },
    'exists.com': {
        expiration: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        exists: true
    }
};

export default (domain: string): Promise<any> =>
    Promise.resolve(((responses[domain as any] as any) || {
        exists: false
    }) as any);

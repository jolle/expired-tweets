const dns: any = jest.genMockFromModule('dns');

dns.resolve = (hostname: string, callback: Function) =>
    hostname.includes('doesnt-exist')
        ? callback(Error())
        : callback(null, ['127.0.0.1']);

module.exports = dns;

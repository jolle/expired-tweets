import { Whois } from './Whois';
import { Provider } from '../Provider';
import { DNS } from './DNS';
import { Social } from './Social';
import { Takeover } from './Takeover';

export default [
    new Whois(),
    new DNS(),
    new Social(),
    new Takeover()
] as Provider[];

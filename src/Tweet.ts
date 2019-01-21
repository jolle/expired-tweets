export class Tweet {
    id: string;
    author: string;
    content: string;
    links: Array<string>;

    constructor(
        id: string,
        author: string,
        content: string,
        links: Array<string>
    ) {
        this.id = id;
        this.author = author;
        this.content = content;
        this.links = links;
    }

    getTweetLink() {
        return `https://twitter.com/${this.author}/status/${this.id}`;
    }
}

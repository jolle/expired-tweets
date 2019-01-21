import * as fs from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import safeEval from 'safe-eval';
import { Tweet } from './Tweet';

const readdir = promisify(fs.readdir);

export type RawGrailbirdData = {
    [tweetArchiveName: string]: {
        source: string;
        entities: {
            user_mentions: {
                name: string;
                screen_name: string;
                indices: number[];
                id_str: string;
                id: number;
            }[];
            media: any[];
            hashtags: any[];
            urls: {
                indices: number[];
                url: string;
                expanded_url: string;
                display_url: string;
            }[];
        };
        in_reply_to_status_id_str: string;
        geo: any;
        id_str: string;
        in_reply_to_user_id: number;
        text: string;
        id: number;
        in_reply_to_status_id: number;
        created_at: string;
        in_reply_to_screen_name: string;
        in_reply_to_user_id_str: string;
        user: {
            name: string;
            screen_name: string;
            protected: boolean;
            id_str: string;
            profile_image_url_https: string;
            id: number;
            verified: boolean;
        };
    }[];
};

export class ArchiveTweetExtractor {
    path: string;

    constructor(path: string) {
        this.path = path;
    }

    /**
     * Tries to find the directory which contains
     * all of the .js files ("tweets")
     *
     * @param path – the root path to loop over
     */
    async findDir(path: string = this.path): Promise<string> {
        const paths = await readdir(path);

        if (paths.indexOf('tweets') > -1) return join(path, 'tweets');

        const tweetDirectories = await Promise.all(
            paths
                .filter(p => fs.statSync(join(path, p)).isDirectory())
                .map(p => this.findDir(join(path, p)))
        );

        const directory = tweetDirectories.find(Boolean);

        return directory || '';
    }

    /**
     * Reads the .js files in the given path and tries
     * to parse the Grailbird data
     *
     * @param path – the path to the root of the JS files
     */
    async readTweetScripts(path: string): Promise<Array<Tweet>> {
        const pathContents = await readdir(path);
        const jsFiles = pathContents.filter(p => p.endsWith('.js'));
        const fileContents = jsFiles.map(p =>
            fs.readFileSync(join(path, p)).toString()
        );
        const grailbirdData = safeEval(
            `Grailbird={data:{}};${fileContents.join('\n')}`
        ).data as RawGrailbirdData;

        return Object.values(grailbirdData)
            .reduce((p, n) => p.concat(n), []) // .flat()
            .map(
                ({ user, text, entities, id_str }) =>
                    new Tweet(
                        id_str,
                        user.screen_name,
                        text,
                        entities
                            ? (entities.urls || []).map(u => u.expanded_url)
                            : []
                    )
            );
    }
}

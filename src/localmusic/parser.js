import fs from "fs";
import Stream from "stream";
import { LocalMusic } from "./music"

export class LocalMusicParser {

    constructor() {
        // Loading database
    }

    /**
     * 
     * @param {String} folder Path of music folder
     * @returns {Promise<LocalMusic[]>} 
     */
    async load(folder) {
        return fs.readdirSync(folder).map((filename) => new LocalMusic(filename));
    }

}

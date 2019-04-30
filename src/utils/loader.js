import fs from "fs";
import path from "path";

const Logger = require('./log');

// Directories
const APP_DIR = path.dirname(require.main.filename);
const RESOURCES_DIR = APP_DIR + path.sep + 'resources';
const MUSICS_DIR = APP_DIR + path.sep + 'musics';

// Files
const CONFIG_FILE = RESOURCES_DIR + path.sep + 'config.json';

// ========================================================================== //

/**
 * Create resource folder if not exists
 * 
 * @author rafaeltoyo
 */
export function createResourcesFolder() {

    try {
        fs.mkdirSync(RESOURCES_DIR, 777);
        Logger.info("Resource folder created!");
    }
    catch (err) {
        if (err.code != 'EEXIST') throw err;
    }
}

/**
 * Application parameters
 * 
 * @author rafaeltoyo
 */
export class Configuration {
    constructor() {
        this.bot = {
            token: '',
            prefix: '$'
        }
        this.ytdl = {
            token: '',
            regionCode: 'BR',
        }
        this.musicFolder = MUSICS_DIR;
        this.projectFolder = APP_DIR;
    }

    json() {
        return {
            bot: {
                token: this.bot.token,
                prefix: this.bot.prefix
            },
            ytdl: {
                token: this.ytdl.token,
                regionCode: this.ytdl.regionCode
            },
            musicFolder: this.musicFolder
        }
    }

    toString() {
        return JSON.stringify(this.json());
    }

    load() {
        createResourcesFolder();

        try {
            let fd = fs.readFileSync(CONFIG_FILE, 'utf-8');
            let config = JSON.parse(fd);

            this.bot = config.bot;
            this.ytdl = config.ytdl;
            this.musicFolder = config.musicFolder;
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                this.save();
                Logger.info("Default configuration created");
            }
            else throw err;
        }
    }

    save(logger) {
        fs.writeFileSync(CONFIG_FILE, this.toString(), 'utf-8');
    }
}

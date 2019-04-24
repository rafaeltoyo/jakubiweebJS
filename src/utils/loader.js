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
        /**
         * @type {String}
         */
        this.prefix = '$';
        this.token = '';
        this.musicFolder = MUSICS_DIR;
        this.projectFolder = APP_DIR;
    }

    json() {
        return {
            bot: {
                prefix: this.prefix,
                token: this.token
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

            this.prefix = config.bot.prefix;
            this.token = config.bot.token;
            this.musicFolder = config.bot.musicFolder;
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

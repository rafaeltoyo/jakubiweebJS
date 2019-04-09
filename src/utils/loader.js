/**
 * @author Rafael Hideo Toyomoto
 * @description Config file loader
 */

const fs = require('fs');
const path = require('path');

// Directories
const APP_DIR = path.dirname(require.main.filename);
const RESOURCES_DIR = APP_DIR + path.sep + 'resources';
const MUSICS_DIR = APP_DIR + path.sep + 'musics';

// Files
const CONFIG_FILE = RESOURCES_DIR + path.sep + 'config.json';

const createResourcesFolder = function (logger) {

    try {
        fs.mkdirSync(RESOURCES_DIR, 0777);
        if (logger != null) logger("Resource folder created!");
    }
    catch (err) {
        if (err.code != 'EEXIST') throw err;
    }
};

const createConfigFile = function (logger) {

    let config = {
        "bot": {
            "token": "",
            "prefix": "$"
        },
        "musicFolder": MUSICS_DIR
    }

    try {
        fd = fs.readFileSync(CONFIG_FILE, 'utf-8');
        config = JSON.parse(fd);
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(config), 'utf-8');
            if (logger != null) logger("Default configurations created");
        }
        else throw err;
    }

    return config;
};

const Resources = function () {
    this.data = null;

    this.start = (logger) => {
        if (logger != null) logger("Loading configurations ...");
        createResourcesFolder(logger);
        this.data = createConfigFile(logger);
    };
};

module.exports = new Resources();

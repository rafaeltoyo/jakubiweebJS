import { Jakubiweeb } from "./src/bot/bot";
import { LocalMusicParser } from "./src/localmusic/parser";
import { Configuration } from "./src/utils/loader";

const config = new Configuration();
config.load();

const lm = new LocalMusicParser();
lm.load(config.musicFolder)
    .then(console.log)
    .catch(console.error);

//const bot = new Jakubiweeb();
//bot.run();

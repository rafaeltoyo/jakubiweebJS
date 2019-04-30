import { Jakubiweeb } from "./src/bot/bot";

import { Configuration } from "./src/utils/loader";
import { YoutubeAPI } from "./src/bot/voice/youtube";

const config = new Configuration();
config.load();

const yt = new YoutubeAPI(config.ytdl.token, config.ytdl.regionCode);
yt.connect();
yt.search("claris connect")
    .then(video => console.log(video))
    .catch(console.error);

//const bot = new Jakubiweeb();
//bot.run();

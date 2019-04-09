
const config = require('./src/utils/loader');
config.start(console.log);

console.log(config.data.bot.token);
console.log(config.data.bot.prefix);
console.log(config.data.musicFolder);

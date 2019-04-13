const Discord = require('discord.js');
const ConfigLoader = require('./utils/loader');
const CommandsLoader = require('./behaviour/commands_loader');

// Creating a client
const client = new Discord.Client();
client.commands = new Discord.Collection();

// Configuration
const config = ConfigLoader.load(console.log);

// Loading commands
CommandsLoader.load(client);

module.exports = {
    start() {
        client.once('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
        });
        client.on('message', this.decode);
        client.login(config.bot.token);
    },

    decode(message) {
        if (!message.content.startsWith(config.bot.prefix) || message.author.bot) 
            return false;

        const args = message.content.slice(config.bot.prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();

        client.commands.get(command).execute(this, message, ...args);
    }
}

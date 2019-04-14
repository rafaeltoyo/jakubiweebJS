const Discord = require('discord.js');
const ConfigLoader = require('./utils/loader');
const CommandsLoader = require('./behaviour/loader');

// Creating a client
const client = new Discord.Client();
client.commands = new Discord.Collection();

// Configuration
const config = new ConfigLoader.Configuration();

// Loading commands
CommandsLoader.load(client);

module.exports = {
    _context: new Discord.Collection(),

    get_context(message) {
        message.guild.id;
    },

    start() {
        config.load();

        client.once('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
        });
        client.on('message', this.decode);
        client.login(config.token);
    },

    decode(message) {
        if (!message.content.startsWith(config.prefix) || message.author.bot) 
            return false;

        const args = message.content.slice(config.prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();

        client.commands.get(command).execute(this, message, ...args);
    }
}

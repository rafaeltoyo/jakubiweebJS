const fs = require('fs');
const path = require('path');
module.exports = {
    load: (client) => {
        // Open commands folder
        const commandFiles = fs.readdirSync(__dirname + path.sep + 'commands').filter(file => file.endsWith('.js'));

        // Find and register all commands
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            client.commands.set(command.name, command);
        }
    }
}

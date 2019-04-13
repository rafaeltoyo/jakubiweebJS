const fs = require('fs');

module.exports = {
    load: (client) => {
        // Open commands folder
        const commandFiles = fs.readdirSync('./src/behaviour/commands')
            .filter(file => file.endsWith('.js'));

        // Find and register all commands
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            client.commands.set(command.name, command);
        }
    }
}

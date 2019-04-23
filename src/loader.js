import path from "path";
import fs from "fs";

import {Collection, Message} from "discord.js";
import {BaseCommand} from "./command";

/**
 * Carrega os comandos na pasta ./src/commands
 * 
 * @param {Collection} commands Lista atual dos comandos
 * @return {Collection} Lista com os comandos carregados
 */
export function loadCommands(commands) {
    // Open commands folder
    const commandFiles = fs.readdirSync(__dirname + path.sep + 'commands').filter(file => file.endsWith('.js'));

    // Find and register all commands
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        if (command instanceof BaseCommand)
            commands.set(command.name, command);
    }
    return commands;
}

/**
 * 
 * @param {string} prefix 
 * @param {Message} message 
 * @return {{string,any[]}}
 */
export function parseCommand(prefix, message) {
    const args = message.content.trim().slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    return { command: command, args: args }
}

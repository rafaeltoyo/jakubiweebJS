import path from "path";
import fs from "fs";

import { Collection, Message, RichEmbed } from "discord.js";
import { Jakubiweeb } from "./bot";
import * as CustomError from "./error";

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
 * @param {string} message 
 * @return {{string,any[]}}
 */
export function parseCommand(prefix, message) {
    const args = message.trim().slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    return { command: command, args: args }
}

/**
 * Classe base de um comando
 * 
 * @author rafaeltoyo
 */
export class BaseCommand {

    /**
     * 
     * @param {String} name 
     * @param {String} description 
     * @param {Array<String>} aliases 
     * @param {String} usage 
     * @param {Number} cooldown 
     * @param {boolean} args
     * @param {boolean} guildOnly
     * @param {boolean} discordOnly
     */
    constructor(name, description, aliases, usage, cooldown, args, guildOnly, discordOnly) {
        this.name = name;
        this.description = description;
        this.aliases = aliases;
        this.usage = usage;
        this.cooldown = cooldown;
        this.args = args;
        this.guildOnly = guildOnly;
        this.discordOnly = discordOnly;
    }

    /**
     * @implements Implementar comportamento do comando
     * 
     * @param {Jakubiweeb} bot Contexto da invocação do comando.
     * @param {Message} msg Mensagem que invocou o comando.
     * @param {string[]} args Argumentos fornecidos para o comando.
     */
    execute(bot, msg, ...args) {
        throw new CustomError.NotImplementedError();
    }

    /**
     * @implements Implementar comportamento do comando
     * 
     * @param {Jakubiweeb} bot Contexto da invocação do comando.
     * @param {string[]} args Argumentos fornecidos para o comando.
     * @return {string} Resposta ao terminal
     */
    execTerminal(bot, ...args) {
        throw new CustomError.NotImplementedError();
    }

    /**
     * Criar mensagem embed com informações detalhadas do comando.
     * 
     * @return {RichEmbed} Mensagem embed.
     */
    createEmbed() {
        let embed = new RichEmbed();
        embed.setColor("#eed040");
        embed.setTitle("Command " + this.name);
        embed.setDescription(this.description);
        embed.addField("Alias:", this.aliases.join(", "), true);
        embed.addField("Usage", this.usage, true);

        return embed;
    }
}

/**
 * Comando <help>
 * 
 * @author rafaeltoyo
 */
export class HelpCmd extends BaseCommand {
    constructor() {
        super(
            "help",
            "Tá perdido meu amiguinho? Conte com o biakinho.",
            ["commands"],
            "[help] or [help <command>]",
            5,
            false,
            false,
            false
        );

        /**
         * @type {Message}
         */
        this.lastHelp = null;
    }

    /**
     * 
     * @param {Jakubiweeb} bot Contexto da invocação do comando.
     * @param {Message} msg Mensagem que invocou o comando.
     * @param {string[]} args Argumentos fornecidos para o comando.
     */
    execute(bot, msg, ...args) {
        let embed = null;

        if (args.length === 1 && args[0].length > 0) {
            let cmd = bot.getCommand(args[0].toLowerCase());
            if (cmd instanceof BaseCommand)
                embed = cmd.createEmbed();
        }

        if (embed === null) {
            embed = this.createEmbed();
            bot.getCommands().forEach(cmd => embed.addField(cmd.name, cmd.description));
        }

        if (this.lastHelp instanceof Message)
            this.deleteLastMessage(() => this.sendNewMessage(msg.channel, embed));
        else
            this.sendNewMessage(msg.channel, embed);
    }

    /**
     * 
     * @param {Jakubiweeb} bot Contexto da invocação do comando.
     * @param {string[]} args Argumentos fornecidos para o comando.
     */
    execTerminal(bot, ...args) {
        if (args.length === 1 && args[0].length > 0) {
            let cmd = bot.getCommand(args[0].toLowerCase());
            if (cmd instanceof BaseCommand)
                return "Command " + cmd.name + ":\n usage: " + cmd.usage + "\n";
        }
        
        let response = "list of commands:\n";
        bot.getCommands().forEach(cmd => {
            if (!cmd.discordOnly)
                response += "[" + cmd.name + "] " + cmd.description + "\n";
        });
        return response;
    }

    sendNewMessage(channel, embed) {
        channel.send(embed).then(m => this.lastHelp = m).catch(console.error);
    }

    deleteLastMessage(callback) {
        this.lastHelp.delete().then(callback).catch(console.error);
    }
}

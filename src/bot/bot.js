import { Message, Client, Collection, RichEmbed } from "discord.js";

import { Configuration } from "../utils/loader";
import Logger from "../utils/log";
import * as CustomError from "./error";
import { loadCommands, parseCommand, BaseCommand, HelpCmd } from "./command";

/**
 * Classe principal do bot
 * 
 * @author rafaeltoyo
 */
export class Jakubiweeb {
    constructor() {
        /**
         * @type {Client}
         */
        this.client = new Client();
        this.client.commands = new Collection();

        /**
         * Configurações
         * @type {Configuration}
         */
        this.config = new Configuration();

        /**
         * Comando Help
         * @type {HelpCmd}
         */
        this.help = new HelpCmd();
    }

    /**
     * Iniciar o bot e colocar para funcionar
     */
    run() {
        this.config.load();
        this.client.commands = loadCommands(this.getCommands());
        //this.client.commands.set(this.help.name, this.help);

        this.client.once('ready', () => this.onStart());
        this.client.on('message', (m) => this.onUpdate(m));

        this.client.login(this.config.token);
    }

    /**
     * Função executada após o bot iniciar
     */
    onStart() {
        Logger.info("Jakubiweeb on!");
        Logger.info("Prefix ...: " + this.config.prefix);
        Logger.info("Token ....: " + this.config.token);
        Logger.info("Music ....: " + this.config.musicFolder);
    }

    /**
     * Função executada após o bot receber uma mensagem
     * @param {Message} message 
     */
    onUpdate(message) {
        const prefix = this.config.prefix;

        if (!message.content.startsWith(prefix) || message.author.bot)
            return false;

        const { command, args } = parseCommand(prefix, message);
        const handler = this.getCommand(command);

        Logger.info("Message received: " + message);
        Logger.info("Command ..: " + command);
        Logger.info("Args .....: " + args.join(" "));

        try {
            if (handler === null)
                throw new CustomError.InvalidCmdError(this.getCommands());

            if (handler.guildOnly && message.channel.type !== "text")
                throw new CustomError.GuildOnlyCmdError(handler);

            if (handler.args && args.length <= 0)
                throw new CustomError.ArgsRequiredCmdError(handler);

            handler.execute(this, message, ...args);
        }
        catch (e) {
            if (e instanceof CustomError.BiakError) {
                message.channel.send(e.getEmbed())
                    .then(m => Logger.log(m.content))
                    .catch(Logger.err);
            }
        }
    }

    // =========================================================================
    // Auxiliares

    /**
     * Retornar o comando pelo nome/alias
     * 
     * @param {string} command Nome ou alias do comando
     * @return {BaseCommand} Objeto commando ou nulo caso não exista
     */
    getCommand(command) {
        if (command.length <= 0)
            return null;
        if (command === "help")
            return this.help;
        return this.getCommands().get(command) || this.getCommands().find(cmd => cmd.aliases && cmd.aliases.includes(command));
    }

    /**
     * Retornar os comandos cadastrados no bot
     * 
     * @return {Collection<String, BaseCommand>} Lista de comandos
     */
    getCommands() {
        return this.client.commands;
    }

}

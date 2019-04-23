import { Message, Client, Collection, RichEmbed } from "discord.js";

import { loadCommands, parseCommand } from "./loader";
import { BaseCommand, HelpCmd } from "./command";
import { Configuration } from "./utils/loader";

/**
 * Classe principal do bot
 * 
 * @author rafaeltoyo
 */
export class Jakubiweeb {
    constructor() {
        // Create a client and load commands
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

    run() {
        this.config.load();
        this.client.commands = loadCommands(this.getCommands());
        //this.client.commands.set(this.help.name, this.help);

        this.client.once('ready', () => this.onStart());
        this.client.on('message', (m) => this.onUpdate(m));

        this.client.login(this.config.token);
    }

    onStart() {
        console.log("Jakubiweeb on!");
        console.log("Prefix ...: " + this.config.prefix);
        console.log("Token ....: " + this.config.token);
        console.log("Music ....: " + this.config.musicFolder);
    }

    /**
     * 
     * @param {Message} message 
     */
    onUpdate(message) {
        const prefix = this.config.prefix;

        if (!message.content.startsWith(prefix) || message.author.bot)
            return false;

        const { command, args } = parseCommand(prefix, message);
        const handler = this.getCommand(command);

        console.log("Message received: " + message);
        console.log("Command ..: " + command);
        console.log("Args .....: " + args.join(" "));

        let error = null;

        if (handler === null) {
            error = this.createInvalidCommandError();
        }
        else if (handler.guildOnly && message.channel.type !== "text") {
            error = this.createGuildOnlyError();
        }
        else if (handler.args && args.length <= 0) {
            error = this.createNumArgsError();
        }

        if (error === null) {
            handler.execute(this, message, ...args);
        }
        else {
            message.channel.send(error);
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

    createGuildOnlyError() {
        let error = new RichEmbed();
        error.setColor("#ff4444");
        error.setTitle("Ops!");
        error.setDescription("Vem pro lab livre fazer esse experimento.");
        return error;
    }

    createNumArgsError(cmd) {
        let error = new RichEmbed();
        error.setColor("#ff4444");
        error.setTitle("Tá faltando um resistor nesse circuito ...");
        error.setDescription("Esquemático: " + cmd.usage);
        return error;
    }

    createInvalidCommandError() {
        let error = new RichEmbed();
        error.setColor("#ff4444");
        error.setTitle("Não achei esse CI na Beta!");
        error.setDescription("Já que você tá na Disney, vou mostrar os produtos da nossa lojinha:");
        this.getCommands().forEach(cmd => error.addField(cmd.name, cmd.description));
        return error;
    }
}

import Readline from "readline";
import Discord from "discord.js";

import { Configuration } from "../utils/loader";
import Logger from "../utils/log";

import * as CustomError from "./error";

import { loadCommands, parseCommand, BaseCommand, HelpCmd } from "./command";

import { YoutubeAPI } from "./api/youtube";

import { GuildStateController, GuildState } from "./voice/state";

/**
 * Classe principal do bot
 * 
 * @author rafaeltoyo
 */
export class Jakubiweeb {
    constructor() {
        /** @type {Discord.Client} */
        this.client = new Discord.Client();
        this.client.commands = new Discord.Collection();

        /**
         * Configurações
         * @type {Configuration}
         */
        this.config = new Configuration();
        this.config.load();

        /**
         * Comando Help
         * @type {HelpCmd}
         */
        this.help = new HelpCmd();

        /**
         * Controle de estado em multiplas Guildas
         * @type {Discord.Collection<Discord.Snowflake, GuildState>} 
         */
        this.states = new Discord.Collection();

        this.api = {
            yt: new YoutubeAPI(this.config.ytdl.token, this.config.ytdl.regionCode)
        };

        this.terminal = Readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    /**
     * Iniciar o bot e colocar para funcionar
     */
    run() {
        this.client.commands = loadCommands(this.getCommands());
        //this.client.commands.set(this.help.name, this.help);

        this.client.once('ready', () => this.onStart());
        this.client.on('message', (m) => this.onUpdate(m));
        this.terminal.on('line', (m) => this.onTerminalInput(m));

        this.client.login(this.config.bot.token);
    }

    /**
     * Função executada após o bot iniciar
     */
    onStart() {
        Logger.info("Jakubiweeb on!");
        Logger.info("Prefix ...: " + this.config.bot.prefix);
        //Logger.info("Token ....: " + this.config.bot.token);
        Logger.info("Music ....: " + this.config.musicFolder);
    }

    /**
     * Função executada após o bot receber uma mensagem
     * @param {Discord.Message} message 
     */
    onUpdate(message) {
        let prefix = this.config.bot.prefix;

        if (!message.content.startsWith(prefix) || message.author.bot)
            return false;

        const { command, args } = parseCommand(prefix, message.content);
        const handler = this.getCommand(command);

        Logger.info("Message received: " + message);
        Logger.info("Command ..: " + command);
        Logger.info("Args .....: " + args.join(" "));

        try {
            this.checkCommand(message, handler, args);
            handler.execute(this, message, ...args);
        }
        catch (e) {
            if (e instanceof CustomError.BiakError || e.name == "BiakError") {
                message.channel.send(e.getEmbed())
                    .then(m => Logger.log(m.content))
                    .catch(Logger.err);
            }
            else {
                Logger.err(e);
            }
        }
    }

    /**
     * Função executada quando houver comando de entrada pelo terminal
     * @param {string} m terminal input
     */
    onTerminalInput(m) {
        if (!m.startsWith('/'))
            return false;
        const { command, args } = parseCommand('/', m);

        if (command == "exit") {
            this.onFinished();
        }
        else {
            const handler = this.getCommand(command);
            try {
                this.checkCommand(null, handler, args);
                const response = handler.execTerminal(this, ...args);
                this.terminal.write(response + (response.endsWith("\n") ? "" : "\n"));
            }
            catch (e) {
                if (e instanceof CustomError.BiakError || e.name == "BiakError") {
                    Logger.err(e.message);
                }
                else {
                    Logger.err(e);
                }
            }
        }
    }

    /**
     * Função executada antes do Bot encerrar suas atividades
     */
    onFinished() {
        (async () => Logger.info("Stopping the bot ..."))()
            .then(() => {
                return Promise.all(this.states.map(state => {
                    (async () => state.destroy())().catch(e => {});
                }))
            })
            .then(() => { return this.states.deleteAll() })
            .then(() => { return this.client.destroy() })
            .then(() => process.exit(0))
            .catch(e => this.onError(e));
    }

    onError(error) {
        Logger.err(error);
        process.exit(1);
    }

    // =========================================================================
    // Auxiliares

    /**
     * @param {Discord.Message} message Mensagem com os dados necessários
     */
    getState(message) {
        const guild = message.guild;
        if (!guild) throw new CustomError.GuildOnlyCmdError();

        if (!this.states.has(guild.id))
            this.states.set(guild.id, new GuildState(guild));
        return this.states.get(guild.id);
    }

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
     * @return {Discord.Collection<String, BaseCommand>} Lista de comandos
     */
    getCommands() {
        return this.client.commands;
    }

    /**
     * Validar a pre-execução do comando
     * 
     * @param {Discord.Message} message Mensagem que invocou o comando
     * @param {BaseCommand} command Comando chamado
     * @param {{string,any[]}} args Argumentos passados
     */
    checkCommand(message, command, args) {
        if (command === null)
            throw new CustomError.InvalidCmdError(this.getCommands());

        if (command.discordOnly && message == null)
            throw new CustomError.DiscordOnlyCmdError(command);

        if (command.guildOnly && (message == null || message.channel.type !== "text"))
            throw new CustomError.GuildOnlyCmdError(command);

        if (command.args && args.length <= 0)
            throw new CustomError.ArgsRequiredCmdError(command);
    }
}

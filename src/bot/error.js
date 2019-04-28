import { RichEmbed } from "discord.js";
import { BaseCommand } from "./command";

/**
 * Erro personalizado para minha aplicação
 * @author rafaeltoyo
 */
export class BiakError extends Error {
    /**
     * 
     * @param {string} title Título do erro
     * @param {string} description Descrição do erro
     */
    constructor(title, description) {
        super(title + " ==> " + description);

        this.constructor = BiakError;
        this.__proto__ = BiakError.prototype;

        this.name = "BiakError";
        this.title = title;
        this.description = description;
    }

    /**
     * Gerar uma mensagem formatada
     * @return {RichEmbed} Mensagem formatada
     */
    getEmbed() {
        let error = new RichEmbed();
        error.setColor("#ff4444");
        error.setTitle(this.title);
        error.setDescription(this.description);
        return error;
    }
}

/**
 * @author rafaeltoyo
 */
export class NotImplementedError extends BiakError {
    /**
     * 
     */
    constructor() {
        super(
            "Não implementado",
            "Funcionalidade ainda não implementada pelos Devs"
        );

        this.constructor = NotImplementedError;
        this.__proto__ = NotImplementedError.prototype;
    }
}

/**
 * @author rafaeltoyo
 */
export class NotInVoiceChannelError extends BiakError {
    /**
     * 
     */
    constructor() {
        super(
            "Ops",
            "Tá fora da festinha, sem rosquinha para você!"
        );

        this.constructor = NotInVoiceChannelError;
        this.__proto__ = NotInVoiceChannelError.prototype;
    }
}

// =============================================================================
// Erros ao processar um comando

/**
 * Estrutura base para erros de comando
 * @author rafaeltoyo
 */
export class CommandError extends BiakError {
    /**
     * 
     * @param {string} title Título do erro
     * @param {string} description Descrição do erro
     * @param {BaseCommand} command Comando que gerou o erro
     */
    constructor(title, description, command) {
        super(title, description);

        this.constructor = CommandError;
        this.__proto__ = CommandError.prototype;

        this.command = command;
    }
}

/**
 * @author rafaeltoyo
 */
export class GuildOnlyCmdError extends CommandError {
    /**
     * 
     * @param {BaseCommand} command Comando que gerou o erro
     */
    constructor(command) {
        super(
            "Ops!",
            "Vem pro lab livre fazer esse experimento.",
            command
        );

        this.constructor = GuildOnlyCmdError;
        this.__proto__ = GuildOnlyCmdError.prototype;
    }
}

/**
 * @author rafaeltoyo
 */
export class ArgsRequiredCmdError extends CommandError {
    /**
     * 
     * @param {BaseCommand} command Comando que gerou o erro
     */
    constructor(command) {
        super(
            "Cade o resistor desse circuito ...",
            "Esquemático: " + command.usage,
            command
        );

        this.constructor = ArgsRequiredCmdError;
        this.__proto__ = ArgsRequiredCmdError.prototype;
    }
}

/**
 * @author rafaeltoyo
 */
export class InvalidCmdError extends CommandError {
    /**
     * 
     * @param {BaseCommand[]} commands Comandos disponíveis
     */
    constructor(commands) {
        super(
            "Não achei esse CI na Beta!",
            "Já que você tá na Disney, vou mostrar os produtos da nossa lojinha:",
            null
        );

        this.constructor = InvalidCmdError;
        this.__proto__ = InvalidCmdError.prototype;

        this.commands = commands;
    }
    getEmbed() {
        let error = super.getEmbed();
        this.commands.forEach(cmd => error.addField(cmd.name, cmd.description));
        return error;
    }
}

/**
 * @author rafaeltoyo
 */
export class DiscordOnlyCmdError extends CommandError {
    /**
     * 
     * @param {BaseCommand} command Comando
     */
    constructor(command) {
        super(
            "Ops!",
            "Comando <" + command.name + "> disponível apenas para discord.",
            command
        );

        this.constructor = DiscordOnlyCmdError;
        this.__proto__ = DiscordOnlyCmdError.prototype;
    }
}

/**
 * @param {Error} error
 * @return {RichEmbed}
 */
export function customErrorHandler(error) {
    if (error instanceof BiakError || error.name === "BiakError")
        return error.getEmbed();

    return (new RichEmbed())
        .setColor("#ff4444")
        .setTitle("Algo deu errado!")
        .setDescription(error.message);
}
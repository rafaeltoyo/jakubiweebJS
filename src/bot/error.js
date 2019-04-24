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
        this.commands = commands;
    }
    getEmbed() {
        let error = super.getEmbed();
        this.commands.forEach(cmd => error.addField(cmd.name, cmd.description));
        return error;
    }
}

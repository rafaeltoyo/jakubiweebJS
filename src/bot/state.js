import { Message, Guild } from "discord.js";
import { Voice } from "./voice/voice";

/**
 * Representação de um estado do bot em um servidor
 * 
 * @author rafaeltoyo
 */
export class State {
    /**
     * 
     * @param {Message} message Mensagem referência
     */
    constructor(message) {
        /**
         * @type {Guild}
         */
        this.guild = message.guild;

        /**
         * @type {Voice}
         */
        this.voice = new Voice();
    }
}

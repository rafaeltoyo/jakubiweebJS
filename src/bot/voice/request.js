import Discord from "discord.js";
import * as CustomError from "../error";

import { Music } from "./music";


/**
 * =============================================================================
 * Requisição para alguma funcionalidade do <GuildStateController>
 * -----------------------------------------------------------------------------
 * @author rafaeltoyo
 * =============================================================================
 */
export class Request {
    /**
     * @param {Discord.Message} message Mensagem enviada
     */
    constructor(message) {
        /** @type {Discord.Guild} */
        this.guild = undefined;

        /** @type {Discord.TextChannel} */
        this.textChannel = undefined;

        /** @type {Discord.VoiceChannel} */
        this.voiceChannel = undefined;

        /** @type {Discord.Message} */
        this.message = message;

        // Processar a mensagem
        this.parse(message);

        /** @type {Music} */
        this.music = undefined;

        /** @type {Discord.Message[]} */
        this.enqueuedMsgs = [];
    }

    async notifyEnqueuedMusic() {
        if (!this.music)
            throw new TypeError("Request without music!");
        this.music.stop();
        return await this.textChannel.send(this.music.getEmbed());
    }

    async notifyPlayingMusic() {
        if (!this.music)
            throw new TypeError("Request without music!");
        if (this.music.status !== Music.PLAYING)
            throw new TypeError("Stopped music!");
        return await this.textChannel.send(this.music.getEmbed());
    }

    /**
     * Extrair informações de uma mensagem
     * 
     * @param {Discord.Message} message
     * @return {Promise<Discord.VoiceChannel>} 
     */
    parse(message) {
        this.guild = message.guild;
        this.textChannel = message.channel;
        if (!this.guild || !(this.textChannel instanceof Discord.TextChannel))
            throw new CustomError.GuildOnlyCmdError();

        this.voiceChannel = message.member.voiceChannel;
        if (!this.voiceChannel)
            throw new CustomError.NotInVoiceChannelError();
    }
}
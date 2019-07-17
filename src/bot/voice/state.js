import Discord from "discord.js";
import * as CustomError from "../error";

import { MusicPlayer } from "./player";
import { Music } from "./music";
import { Request } from "./request"


/**
 * Representação de um estado do bot em um servidor
 * @author rafaeltoyo
 */
export class GuildState {
    /**
     * 
     * @param {Discord.Guild} guild
     */
    constructor(guild) {
        /** @type {Discord.Guild} */
        this.guild = guild;

        /** @type {MusicPlayer} */
        this.player = undefined;

        /** @type {Discord.TextChannel} */
        this.textChannel = undefined;

        /** @type {Discord.VoiceChannel} */
        this.voiceChannel = undefined;
    }

    /**
     * Registrar um pedido de música para ser tocada nessa Guilda
     * @param {Discord.Message} message Mensagem origem
     * @param {Music} music Música requistada
     */
    async playMusic(message, music) {
        if (message.member && message.member.voiceChannel)
            await this.swap(message.member.voiceChannel);

        const req = new Request(message);
        req.music = music;

        this.player.play(req);
        return req;
    }

    /** Pular a música atual */
    skipMusic() {
        if (!this.player.isPlaying())
            throw new CustomError.NotPlayingError();
        this.player.skip();
    }

    /**
     * Trocar de canal de voz.
     * Se já estiver em um canal, desconecta dele e muda para o outro.
     * @param {Discord.VoiceChannel} voiceChannel Canal de voz
     * @return {Promise<Discord.VoiceConnection>}
     */
    async swap(voiceChannel) {
        if (this.voiceChannel) {
            if (this.voiceChannel.id === voiceChannel.id)
                return this.voiceChannel.connection;
            else
                this.leave();
        }
        return await this.join(voiceChannel);
    }

    /**
     * Conectar ao canal de voz.
     * @param {Discord.VoiceChannel} voiceChannel Canal de voz
     * @return {Promise<Discord.VoiceConnection>}
     */
    async join(voiceChannel) {
        try {
            if (this.voiceChannel)
                throw new CustomError.AlreadyInVoiceChannelError();

            const conn = await voiceChannel.join();
            this.voiceChannel = voiceChannel;
            this.player = new MusicPlayer(this.voiceChannel.connection);
            return conn;
        }
        catch (error) {
            this.voiceChannel = undefined;
            throw error;
        }
    }

    /**
     * Desconectar do canal de voz (se estiver em um)
     */
    leave() {
        try {
            if (!this.voiceChannel)
                throw new CustomError.NotInVoiceChannelError();
            this.voiceChannel.leave();
        }
        finally {
            this.voiceChannel = undefined;
        }
    }

    destroy() {
        if (!this.player) {
            this.player.destroy();
            this.player = undefined;
        }
        if (!this.voiceChannel) {
            this.voiceChannel.connection.disconnect();
            this.voiceChannel.leave();
            this.voiceChannel = undefined;
        }
    }
}

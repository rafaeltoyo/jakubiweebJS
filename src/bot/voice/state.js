import Discord from "discord.js";
import { MusicPlayer, Music } from "./music";
import * as CustomError from "../error";


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

/**
 * =============================================================================
 * Representação de um estado do bot em um servidor
 * -----------------------------------------------------------------------------
 * @author rafaeltoyo
 * =============================================================================
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

    //--------------------------------------------------------------------------
    // Manipulação da conexão em um canal de voz

    /**
     * Conectar ao canal de voz.
     * Se já estiver em um canal, desconecta dele e muda para o outro.
     * 
     * @param {Discord.VoiceChannel} voiceChannel 
     * @return {Discord.VoiceConnection}
     */
    async reconnect(voiceChannel) {
        try {
            if (this.voiceChannel) {
                if (this.voiceChannel.id === voiceChannel.id)
                    return this.voiceChannel.connection;
                else
                    this.disconnect();
            }
            return await this.connect(voiceChannel);
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * Conectar ao canal de voz.
     * Cuidado se já houve uma conexão, pois ela não é tratada nesse método.
     * Caso haja uma conexão já aberta, utilize o <reconnect(msg)>.
     * 
     * @param {Discord.VoiceChannel} voiceChannel 
     * @return {Promise<Discord.VoiceConnection>}
     */
    async connect(voiceChannel) {
        try {
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
     * Desconectar do canal de voz
     * 
     * @return {Promise}
     */
    disconnect() {
        try {
            if (!this.voiceChannel)
                throw new CustomError.NotInVoiceChannelError();
            this.voiceChannel.leave();
        }
        catch (error) {
            throw error;
        }
        finally {
            this.voiceChannel = undefined;
        }
    }

}

/**
 * =============================================================================
 * Controlador de estados do bot
 * -----------------------------------------------------------------------------
 * @author rafaeltoyo
 * =============================================================================
 */
export class GuildStateController {

    constructor() {
        /** @type {Collection<Discord.Snowflake, GuildState>} */
        this.states = new Discord.Collection();
    }

    /**
     * @param {Discord.Message} message 
     * @return {Request}
     */
    createRequest(message) {
        return new Request(message);
    }

    /**
     * @param {Request} request 
     * @return {Promise<Discord.VoiceConnection>}
     */
    async changeVoiceChannel(request) {
        const state = this.getState(request.guild);
        return await state.reconnect(request.voiceChannel);
    }

    /**
     * @param {Request} request 
     * @return {*}
     */
    playMusic(request) {
        const state = this.getState(request.guild);
        return state.player.play(request);
    }

    // -------------------------------------------------------------------------
    // Basic method

    /**
     * Criar um estado para uma <Guild>
     * @param {Discord.Guild} guild
     */
    createState(guild) {
        const state = new GuildState(guild);
        this.states.set(guild.id, state);
        return state;
    }

    /**
     * Restaurar um estado para uma <Guild>
     * @param {Discord.Guild} guild
     * @return {GuildState}
     */
    getState(guild) {
        return this.states.get(guild.id) || this.createState(guild);
    }

    destroyState(guild) {
        this.states.delete(guild.id);
    }

    async destroyAll() {
        this.states.forEach(state => state.disconnect());
        await Promise.all(this.states.map(state => state.disconnect().catch(error => { })));
        this.states.deleteAll();
    }
}

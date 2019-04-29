import Discord from "discord.js";
import { MusicPlayer } from "./music";
import Logger from "../../utils/log";
import * as CustomError from "../error";

/**
 * Representação de um estado do bot em um servidor
 * 
 * @author rafaeltoyo
 */
export class State {
    /**
     * 
     * @param {Discord.Guild} guild
     */
    constructor(guild) {
        /** @type {Discord.Guild} */
        this.guild = guild;

        /** @type {MusicPlayer} */
        this.player = new MusicPlayer();

        /** @type {Discord.TextChannel} */
        this.textChannel = undefined;

        /** @type {Discord.VoiceChannel} */
        this.voiceChannel = undefined;
    }

    // =========================================================================
    // Manipulação da conexão em um canal de voz

    /**
     * Conectar ao canal de voz de uma mensagem.
     * Se já estiver em um canal, desconecta dele e muda para o outro.
     * 
     * @param {Discord.Message} message 
     * @return {Discord.VoiceConnection}
     */
    async reconnect(message) {
        try {
            if (this.voiceChannel)
                await this.disconnect();
            return await this.connect(message);
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * Conectar ao canal de voz de uma mensagem.
     * Cuidado se já houve uma conexão, pois ela não é tratada nesse método.
     * Caso haja uma conexão já aberta, utilize o <reconnect(msg)>.
     * 
     * @param {Discord.Message} message 
     * @return {Promise<Discord.VoiceConnection>}
     */
    connect(message) {
        return new Promise((resolve, reject) => {
            return this.getVoiceChannel(message)
                .then(voiceChannel => {
                    this.textChannel = message.channel;
                    this.voiceChannel = voiceChannel;
                    return voiceChannel.join();
                })
                .then(conn => {
                    resolve(conn);
                })
                .catch(error => {
                    this.textChannel = undefined;
                    this.voiceChannel = undefined;
                    reject(error);
                });
        });
    }

    /**
     * Desconectar do canal de voz
     * 
     * @return {Promise}
     */
    disconnect() {
        return new Promise((resolve, reject) => {
            try {
                if (!this.voiceChannel)
                    throw new CustomError.NotInVoiceChannelError();
                this.voiceChannel.leave();
                resolve();
            }
            catch (error) {
                reject(error);
            }
            finally {
                this.voiceChannel = undefined;
            }
        });
    }

    // =========================================================================
    // Manipular a conexão de voz enviando streaming de dados

    // =========================================================================
    // Auxiliares

    /**
     * Extrair o canal de voz da mensagem
     * 
     * @param {Discord.Message} message
     * @return {Promise} 
     */
    getVoiceChannel(message) {
        return new Promise((resolve, reject) => {
            const voiceChannel = message.member.voiceChannel;
            if (!voiceChannel)
                reject(new CustomError.NotInVoiceChannelError());
            else
                resolve(voiceChannel);
        });
    }
}

/**
 * Controlador de estados do bot
 * 
 * @author rafaeltoyo
 */
export class StateController {
    constructor() {
        /**
         * @type {Collection<Discord.Snowflake, State>}
         */
        this.states = new Discord.Collection();
    }


    // =========================================================================
    // Basic method

    /**
     * Criar um estado para uma <Guild>
     * @param {Discord.Guild} guild
     */
    createState(guild) {
        const state = new State(guild);
        this.getStates().set(guild.id, state);
        return state;
    }

    /**
     * Restaurar um estado para uma <Guild>
     * @param {Discord.Guild} guild
     * @return {State}
     */
    getState(guild) {
        return this.getStates().get(guild.id) || this.createState(guild);
    }

    /**
     * @return {Discord.Collection<Discord.Snowflake, State>}
     */
    getStates() {
        return this.states;
    }

    destroyState(guild) {
        this.getStates().delete(guild.id);
    }

    async destroyAll() {
        this.getStates().forEach(state => state.disconnect());
        await Promise.all(this.getStates().map(state => state.disconnect().catch(error => {})));
        this.getStates().deleteAll();
    }
}

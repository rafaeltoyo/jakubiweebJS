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

    /**
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

    /**
     * 
     * @param {Discord.Message} message
     * @return {Discord.VoiceChannel} 
     */
    getVoiceChannel(message) {
        return new Promise((resolve, reject) => {
            const voiceChannel = message.member.voiceChannel;
            if (!voiceChannel) reject(new CustomError.NotInVoiceChannelError());
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

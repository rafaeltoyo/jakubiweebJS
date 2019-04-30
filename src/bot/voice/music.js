import Discord from "discord.js";
import moment from "moment";
import { Mutex } from 'async-mutex';

import * as CustomError from "../error";


export function searchYTMusic(musicName) {
    return 
}

export class Music {
    /**
     * @param {string} musicId Identificador da música
     * @param {Discord.GuildMember} requester Usuário que está solicitando
     */
    constructor(musicId, title, requester) {
        // Music info
        this.id = musicId;
        this.title = title;
        this.description = description;
        this.duration = null;

        // Request info
        this.requester = {
            id: requester ? requester.id : null,
            name: requester ? requester.displayName : null,
            avatar: requester ? requester.user.displayAvatarURL : null,
        };
    }

    /** Inicializa o atributo duration (pois é obtido em uma consulta separada).
     * @param {string} duration duracão da música no formato ISO 8601
     */
    setDuration(duration) {
        this.duration = moment.duration(duration);
    }

    getEmbed() {
        // now playing
        // enqueued
        let embed = new Discord.RichEmbed();
        embed.setTitle(this.title);
        embed.setDescription();
        embed.setThumbnail();
        embed.setURL();
        return embed;
    }
}

/**
 * Classe de controle da reprodução de áudio
 * 
 * @author rafaeltoyo
 */
export class MusicPlayer {
    /**
     * 
     * @param {Discord.VoiceConnection} voiceConnection 
     */
    constructor(voiceConnection) {
        /** @type {Discord.VoiceConnection} */
        this.voiceConnection = voiceConnection;

        /** @type {Discord.StreamDispatcher} */
        this.dispatcher = undefined;

        /** @type {Number} */
        this.volume = 0.3;
    }

    /**
     * 
     * @param {ReadableStream} stream 
     */
    accept(stream) {

    }

    /**
     * 
     * @param {ReadableStream} stream 
     */
    play(stream) {
        return new Promise((resolve, reject) => {
            this.dispatcher = this.voiceConnection.playStream(stream);
            this.dispatcher.setVolume(this.volume);

            this.dispatcher.on('end', reason => {
                resolve(reason);
            });
            this.dispatcher.on('error', error => {
                reject(error);
            });
        });
    }

    stop() { }

    async resume() {
        if (this.dispatcher === undefined)
            throw new CustomError.NotInVoiceChannelError();
        if (!this.dispatcher.paused)
            throw new CustomError.SimpleBiakError("Não estou pausado");
        this.dispatcher.resume();
    }

    async pause() {
        if (this.dispatcher === undefined)
            throw new CustomError.NotInVoiceChannelError();
        if (this.dispatcher.paused)
            throw new CustomError.SimpleBiakError("Já estou pausado");
        this.dispatcher.pause();
    }

    isPlaying() { return this.dispatcher !== undefined; }
}

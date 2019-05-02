import Discord from "discord.js";
import events from "events";
import moment from "moment";
import { Mutex } from 'async-mutex';

import { Request } from "./state";
import * as CustomError from "../error";


const DEFAULT_VOLUME = 0.3;

export function searchYTMusic(musicName) {
    return
}

export class Music {
    static get STOPPED() { return 1 };
    static get PLAYING() { return 2 };

    /**
     * @param {string} musicId Identificador da música
     * @param {string} descrition Descrição sobre a música
     * @param {Discord.GuildMember} requester Usuário que está solicitando
     */
    constructor(musicId, description, requester) {
        // Music info
        this.id = musicId;
        this.description = description;

        this.duration = null;

        // Request info
        this.requester = {
            id: requester ? requester.id : null,
            name: requester ? requester.displayName : null,
            avatar: requester ? requester.user.displayAvatarURL : null,
        };

        // Status
        this.status = Music.STOPPED;
    }

    /**
     * Iniciar a reprodução da música
     * @implements Implementar a criação do dispatcher a partir do <musicId> e
     *              <voiceConnection> e trocar o status para PLAYING.
     * 
     * @param {Discord.VoiceConnection} voiceConnection 
     * @return {Discord.StreamDispatcher}
     */
    play(voiceConnection) {
        throw new CustomError.NotImplementedError();
    }

    /**
     * Configurar a música para o status parado
     */
    stop() { this.status = Music.STOPPED; }

    /**
     * Inicializa o atributo duration (pois é obtido em uma consulta separada).
     * @param {string} duration duracão da música no formato ISO 8601
     */
    setDuration(duration) {
        this.duration = moment.duration(duration);
    }

    getEmbed() {
        let embed = new Discord.RichEmbed();
        // Title and Color
        if (this.status === Music.PLAYING) {
            embed.setTitle("Now playing");
            embed.setColor(0x3a994d);
        }
        else {
            embed.setTitle("Enqueued");
            embed.setColor(0x3974d3);
        }
        // Requester
        if (this.requester.id) {
            embed.setFooter(this.requester.name, this.requester.avatar);
        }
        // Song name
        embed.setDescription(this.description);
        //embed.setThumbnail();
        //embed.setURL();
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

        /** @type {Number} */
        this.volume = DEFAULT_VOLUME;

        /** @type {Array<Request>} */
        this.queue = [];
        this.queue.pointer = -1;

        /** @type {Discord.StreamDispatcher} */
        this.dispatcher = undefined;

        /** @type {Discord.Message} */
        this.nowPlayingMsg = undefined;
    }

    // -------------------------------------------------------------------------
    // Configurações

    setVolume(v) { this.volume = (v >= 1 && v <= 0) ? parseFloat(v) : DEFAULT_VOLUME; }

    // -------------------------------------------------------------------------
    // Listener

    onMusicEnd(reason) {
        // Destroying current dispatcher (current music ended)
        this.dispatcher = undefined;
        if (reason === "stop") return;

        if (this.queue.length <= this.queue.pointer) {
            // Empty queue
            // Autoplay?
        }
        else {
            this.queue.pointer++;
            this.startCurrentMusic();
        }
    }

    startCurrentMusic() {
        if (this.queue.length <= this.queue.pointer)
            return false;

        const request = this.queue[this.queue.pointer];

        this.dispatcher = request.music.play(this.voiceConnection);
        this.dispatcher.setVolume(this.volume);
        this.dispatcher.on('end', reason => this.onMusicEnd(reason));
        this.dispatcher.on('error', error => this.skip());

        request.notifyPlayingMusic()
            .then(m => {
                const aux = this.nowPlayingMsg;
                this.nowPlayingMsg = m;
                if (aux) return aux.delete();
            })
            .then(m => {
                return Promise.all(request.enqueuedMsgs.map(msg => msg.delete().catch(e => { })));
            })
            .then(msgs => {
                request.enqueuedMsgs = [];
            })
            .catch(e => {
                request.enqueuedMsgs = [];
            });
    }

    /**
     * 
     * @param {Request} request 
     */
    play(request) {
        if (!request.music) throw new TypeError("Request without music!");

        this.queue.push(request);

        if (!this.isPlaying()) {
            this.queue.pointer = this.queue.pointer < 0 ? 0 : this.queue.length - 1;
            this.startCurrentMusic();
        }
        else {
            request.notifyEnqueuedMusic().then(m => request.enqueuedMsgs.push(m));
        }
    }

    clear() {
        this.queue = [];
        this.queue.pointer = -1;
        if (this.isPlaying()) {
            this.skip();
        }
    }

    skip() {
        this.dispatcher.pause();
        this.dispatcher.end("skip");
    }

    stop() {
        this.dispatcher.pause();
        this.dispatcher.end("stop");
    }

    resume() {
        if (this.voiceConnection === undefined)
            throw new CustomError.NotInVoiceChannelError();
        if (this.dispatcher === undefined)
            throw new CustomError.SimpleBiakError("Não tocando nada");
        if (!this.dispatcher.paused)
            throw new CustomError.SimpleBiakError("Não estou pausado");
        this.dispatcher.resume();
    }

    pause() {
        if (this.voiceConnection === undefined)
            throw new CustomError.NotInVoiceChannelError();
        if (this.dispatcher === undefined)
            throw new CustomError.SimpleBiakError("Não tocando nada");
        if (this.dispatcher.paused)
            throw new CustomError.SimpleBiakError("Já estou pausado");
        this.dispatcher.pause();
    }

    isPlaying() { return this.dispatcher; }
}

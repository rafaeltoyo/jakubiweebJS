import Discord from "discord.js";
import { Mutex } from 'async-mutex';

import { Request } from "./state";
import * as CustomError from "../error";


const DEFAULT_VOLUME = 0.3;

/** @author rafaeltoyo */
class MusicPlayerQueue {
    constructor() {
        /** @type {MusicPlayerItem[]} */
        this.items = [];
        /** @type {Number} */
        this.iter = -1;
    }

    clear() {
        this.items = [];
        this.iter = -1;
    }

    /** @return {boolean} */
    isEmpty() {
        return (this.items.length - 1) <= (this.iter);
    }

    /** @return {MusicPlayerItem} */
    next() {
        if (this.isEmpty()) throw new TypeError("End of music queue");
        return this.items[++this.iter];
    }

    /**
     * @param {MusicPlayerItem} music Nova música
     */
    add(music) {
        this.items.push(music);
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

        /** @type {Request[]} */
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

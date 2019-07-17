import Discord from "discord.js";
import { Mutex } from 'async-mutex';

import { Request } from "./request";
import * as CustomError from "../error";
import Logger from "../../utils/log";


const DEFAULT_VOLUME = 0.3;

/**
 * =============================================================================
 * Classe de controle da reprodução de áudio
 * -----------------------------------------------------------------------------
 * @author rafaeltoyo
 * =============================================================================
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
    // Settings

    setVolume(v) {
        this.volume = (v >= 1 && v <= 0) ? parseFloat(v) : DEFAULT_VOLUME;
    }

    // -------------------------------------------------------------------------
    // Listener

    onMusicEnd(reason) {
        Logger.log("Music ended" + (!reason ? "" : ": " + reason));

        // Destroying current dispatcher (current music ended)
        this.getCurrentMusic().music.stop();
        this.dispatcher.pause();
        this.dispatcher = undefined;

        // Continue when the reason isn't equals 'stop'
        if (reason === "stop") return;

        // Move the pointer to the next music
        this.queue.pointer++;

        // Have more musics to play?
        if (this.hasMusic()) {
            // Play the current music
            this.startCurrentMusic();
        }
        else {
            // The queue doesn't have more music

            if (this.queue.length > 0) {
                // Has a previous music
                /** @todo AUTOPLAY */
            }
            else {
                // Empty queue
                // waiting for new entries
            }
        }
    }

    startCurrentMusic() {
        // Has music to play?
        if (!(this.hasMusic())) return false;

        // Get the current request
        const request = this.getCurrentMusic();

        // Prepare the dispatcher with the current music
        this.dispatcher = request.music.play(this.voiceConnection);
        this.dispatcher.setVolume(this.volume);
        this.dispatcher.on('end', reason => this.onMusicEnd(reason));
        this.dispatcher.on('error', error => {
            this.skip();
            Logger.err(error);
        });

        Logger.info(request.music);

        // Notify all users with what is playing now
        request.notifyPlayingMusic()
            .then(m => {
                const aux = this.nowPlayingMsg;
                this.nowPlayingMsg = m;
                if (aux) return aux.delete();
            })
            .then(m => {
                // Delete all request message
                return Promise.all(request.enqueuedMsgs.map(msg => {
                    msg.delete().catch(e => { /* ignore the exception */ });
                }));
            })
            .then(msgs => { request.enqueuedMsgs = []; })
            .catch(e => { request.enqueuedMsgs = []; });
        return true;
    }

    /**
     * 
     * @param {Request} request 
     */
    play(request) {
        // The request needs a music
        if (!request.music) throw new Error("Request without music!");

        // Adding that in the queue
        this.queue.push(request);

        if (!this.isPlaying()) {
            this.queue.pointer = (this.queue.length - 1);
            if (!this.startCurrentMusic()) throw new Error("Error until starting the queue")
        }
        else {
            request.notifyEnqueuedMusic().then(m => request.enqueuedMsgs.push(m));
        }
    }

    clear() {
        // If the player is playing any music so stop that
        if (this.isPlaying()) this.stop();
        // Clear the queue
        this.queue = [];
        // Reset the music pointer
        this.queue.pointer = -1;
    }

    skip() {
        if (!this.dispatcher) return;

        // Pause the dispatcher
        this.dispatcher.pause();
        // Invoke 'end' event with 'skip' reason
        this.dispatcher.end("skip");
    }

    stop() {
        if (!this.dispatcher) return;

        // Pause the dispatcher
        this.dispatcher.pause();
        // Invoke 'end' event with 'stop' reason
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

    destroy() {
        this.clear();
    }

    // -------------------------------------------------------------------------
    // Utils

    isPlaying() { return this.dispatcher; }

    isQueueEmpty() { return this.queue.length <= 0 }

    isLastMusic() { return this.queue.pointer >= (this.queue.length - 1) }

    isValidMusic() { return this.queue.pointer <= (this.queue.length - 1); }

    hasMusic() { return !(this.isQueueEmpty()) && (this.isValidMusic()); }

    getCurrentMusic() { return this.queue[this.queue.pointer]; }
}

import Discord from "discord.js";
import * as CustomError from "../error";

/**
 * 
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

    stop() {}

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

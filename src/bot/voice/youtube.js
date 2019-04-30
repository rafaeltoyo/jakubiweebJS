import { URL } from "url";

import * as ytdl from "ytdl-core";
import { google as GoogleAPIs, youtube_v3, GoogleApis } from "googleapis";

import { Music } from "./music";
import * as CustomError from "../error";


const ytdlOptions = {
    quality: "highestaudio",
    filter: "audioonly",
    highWaterMark: 1 << 25,
};


export class YoutubeAPI {
    /**
     * @param {string} token GoogleAPI token
     * @param {string} regionCode Region code ISO_3166-1
     */
    constructor(token, regionCode) {
        /** @type {string} */
        this.token = token;

        /** @type {string} */
        this.regionCode = regionCode;

        /** @type {youtube_v3.Youtube} */
        this.api = undefined;
    }

    connect() {
        this.api = GoogleAPIs.youtube({ version: "v3", auth: this.token });
    }

    checkResponse(response) {
        if (response.status !== 200) {
            throw new CustomError.SimpleBiakError("Erro na requisição da API");
        }
        if (response.data.items.length === 0) {
            throw new CustomError.SimpleBiakError("Nada encontrado");
        }
        return response;
    }

    /**
     * 
     * @param {string} query 
     * @return {Promise<youtube_v3.Schema$SearchResult>}
     */
    search(query) {
        return new Promise((resolve, reject) => {
            this.api.search.list(this.defaultOptions({ q: query }))
                .then(res => {
                    this.checkResponse(res);
                    return res.data.items[0];
                })
                .then(video => this.details(video))
                .then(data => resolve(data))
                .catch(error => reject(error));
        });
    }

    /**
     * 
     * @param {youtube_v3.Schema$SearchResult} video 
     * @return {Promise<youtube_v3.Schema$SearchResult>}
     */
    details(video) {
        return new Promise((resolve, reject) => {
            const options = { part: "contentDetails", id: video.id.videoId };
            this.api.videos.list(options)
                .then(res => {
                    this.checkResponse(res);
                    video.details = res.data.items[0].contentDetails;
                    resolve(video);
                })
                .catch(error => reject(error));
        });
    }

    defaultOptions(options) {
        options = (options) ? options : {};
        options.regionCode = this.region;
        options.type = 'video';
        options.part = 'snippet';
        options.maxResults = 5;
        return options;
    }
}

/**
 * 
 * @param {string|URL} url Url de consulta
 * @return {Promise<string>} Traz o ID do vídeo da URL
 */
export function parseYTUrl(url) {
    return new Promise((resolve, reject) => {
        const parsedUrl = (url instanceof URL) ? url : new URL(url, 'http://' + url);

        let videoId = "";
        let startTime = "";

        if ((/^(www\.)?youtube\.com/g).test(parsedUrl.hostname)) {
            if (parsedUrl.search) {
                videoId = parsedUrl.searchParams.get('v');
                startTime = parsedUrl.searchParams.get('t');
                if (videoId) {
                    resolve(videoId);
                }
            }
            else {
                reject(new CustomError.SimpleBiakError("Url sem vídeo."));
            }
        }
        else if ((/^youtu\.be/g).test(parsedUrl.hostname)) {
            if (parsedUrl.pathname && parsedUrl.pathname.length > 1) {
                videoId = parsedUrl.pathname.slice(1);
                startTime = parsedUrl.searchParams.get('t');
                if (videoId) {
                    resolve(videoId);
                }
            }
            else {
                reject(new CustomError.SimpleBiakError("Url sem vídeo."));
            }
        }
        else {
            reject(new CustomError.SimpleBiakError("Serviço não implementado para " + parsedUrl.hostname));
        }
    });
}

export class YoutubeMusic {
    constructor(video) {
        this.id = video.id.videoId;
        this.title = video.snippet.title;
        this.channelTitle = video.snippet.channelTitle;
        this.thumbnail = video.snippet.thumbnails.default.url;
    }
}

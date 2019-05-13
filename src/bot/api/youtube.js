import { URL } from "url";
import Discord from "discord.js";

import ytdl from "ytdl-core";
import { google as GoogleAPIs, youtube_v3, GoogleApis } from "googleapis";

import { Music } from "../voice/music";
import * as CustomError from "../error";


const ytdlOptions = {
    quality: "highestaudio",
    filter: "audioonly",
    highWaterMark: 1 << 25,
};

/**
 * @author rafaeltoyo
 * @param {youtube_v3.Schema$SearchListResponse} response 
 * @return {youtube_v3.Schema$SearchListResponse}
 */
function checkResponse(response) {
    if (response.status !== 200) {
        throw new CustomError.SimpleBiakError("Erro na requisição da API");
    }
    if (response.data.items.length === 0) {
        throw new CustomError.SimpleBiakError("Nada encontrado");
    }
    return response;
}

/**
 * @author rafaeltoyo
 * @param {string|URL} url Url de consulta
 * @return {Promise<string>} Traz o ID do vídeo da URL
 */
function parseYTUrl(url) {
    return new Promise((resolve, reject) => {
        const parsedUrl = (url instanceof URL) ? url : new URL(url, 'http://' + url);

        let videoId = "";
        let startTime = "";

        if ((/^(www\.)?youtube\.com/g).test(parsedUrl.hostname)) {
            if (parsedUrl.search) {
                videoId = parsedUrl.searchParams.get('v');
                startTime = parsedUrl.searchParams.get('t');
                if (videoId) resolve(videoId);
            }
            else reject(new CustomError.SimpleBiakError("Url sem vídeo."));
        }
        else if ((/^youtu\.be/g).test(parsedUrl.hostname)) {
            if (parsedUrl.pathname && parsedUrl.pathname.length > 1) {
                videoId = parsedUrl.pathname.slice(1);
                startTime = parsedUrl.searchParams.get('t');
                if (videoId) resolve(videoId);
            }
            else reject(new CustomError.SimpleBiakError("Url sem vídeo."));
        }
        else {
            reject(new CustomError.SimpleBiakError("Serviço não implementado para " + parsedUrl.hostname));
        }
    });
}

export class YoutubeMusic extends Music {
    /**
     * @param {youtube_v3.Schema$SearchResult} video Resultado da busca
     * @param {Discord.GuildMember} requester Usuário que está solicitando
     */
    constructor(video, requester) {
        const url = "https://www.youtube.com/watch?v=" + video.id;

        super(video.id, '[' + video.snippet.title + '](' + url + ')', requester);
        this.channelTitle = video.snippet.channelTitle;
        this.thumbnail = video.snippet.thumbnails.default.url;
        this.videoUrl = url;
    }

    /**
     * Iniciar a reprodução da música
     * 
     * @param {Discord.VoiceConnection} voiceConnection 
     * @return {Discord.StreamDispatcher}
     */
    play(voiceConnection) {
        const stream = ytdl(this.videoUrl, ytdlOptions);
        const conn = voiceConnection.playStream(stream);
        this.status = Music.PLAYING;
        return conn;
    }

    getEmbed() {
        let embed = super.getEmbed();
        embed.setThumbnail(this.thumbnail);
        embed.setURL();
        return embed;
    }
}

/**
 * Classe para tratar a API do youtube
 * 
 * @author rafaeltoyo
 */
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
        this.conn = GoogleAPIs.youtube({ version: "v3", auth: this.token });
    }

    /**
     * Buscar uma música pela API do YouTube
     * @param {string} query 
     * @param {Discord.GuildMember} requester
     * @return {Promise<YoutubeMusic>}
     */
    async search(query, requester) {
        let videoId = null;
        let res = null;

        try {
            // Tentar interpretar a entrada como uma URL do Youtube
            videoId = await parseYTUrl(query);
        }
        catch (e) {
            // Erros de API
            if (error instanceof CustomError.BiakError) throw error;

            // URL inválida, tratar como simples busca
            res = await this.conn.search.list(this.defaultOptions({ q: query }));
            checkResponse(res);
            videoId = res.data.items[0].id.videoId;
        }

        // Consultar mais detalhes do vídeo
        res = await this.conn.videos.list({ id: videoId, part: "snippet,contentDetails" });
        checkResponse(res);

        // Construir a representação do vídeo
        return new YoutubeMusic(res.data.items[0], requester);
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

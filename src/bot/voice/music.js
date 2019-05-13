import Discord from "discord.js";
import moment from "moment";

import * as CustomError from "../error";


/**
 * =============================================================================
 * Representação de uma música e funcionalidades para o Discord
 * -----------------------------------------------------------------------------
 * @author rafaeltoyo
 * =============================================================================
 */
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
     * @implements
     * Criar dispatcher a partir do <musicId> e <voiceConnection>, e trocar o status para PLAYING.
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

    /**
     * Construir uma mensagem sobre a música
     * @return {Discord.RichEmbed} Mensagem Embed
     */
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
        return embed;
    }
}


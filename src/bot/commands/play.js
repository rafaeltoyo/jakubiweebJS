import { Message } from "discord.js";
import { Jakubiweeb } from "../bot";
import { BaseCommand } from "../command";
import { customErrorHandler } from "../error";

/**
 * Comando <stop>
 * 
 * @author rafaeltoyo
 */
class Play extends BaseCommand {
    constructor() {
        super(
            "play",
            "Tocar musiquinhas.",
            ["p"],
            "[play <nome da musica>]",
            5,
            true,
            true,
            true
        );
    }

    /**
     * 
     * @param {Jakubiweeb} bot Contexto da invocação do comando.
     * @param {Message} msg Mensagem que invocou o comando.
     * @param {string[]} args Argumentos fornecidos para o comando.
     */
    execute(bot, msg, ...args) {
        const query = args.join(" ");
        const request = bot.states.createRequest(msg);

        bot.states.changeVoiceChannel(request)
            .then(conn => {
                return bot.api.yt.play(query, msg.member);
            })
            .then(music => {
                request.music = music;
                bot.states.playMusic(request);
            })
            .catch(error => msg.channel.send(customErrorHandler(error)));
    }
}

module.exports = new Play();

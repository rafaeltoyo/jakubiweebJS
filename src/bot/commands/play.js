import { Message } from "discord.js";
import { Jakubiweeb } from "../bot";
import { BaseCommand } from "../command";
import { customErrorHandler } from "../error";

/**
 * Comando <play>
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
        bot.api.yt.search(args.join(" "))
            .then(music => {
                return bot.getState(msg).playMusic(msg, music);
            })
            .catch(error => msg.channel.send(customErrorHandler(error)));
    }
}

module.exports = new Play();

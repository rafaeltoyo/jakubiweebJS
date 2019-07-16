import { Message, RichEmbed } from "discord.js";
import { Jakubiweeb } from "../bot";
import { BaseCommand } from "../command";
import { customErrorHandler } from "../error";

/**
 * Comando <play>
 * 
 * @author rafaeltoyo
 */
class Queue extends BaseCommand {
    constructor() {
        super(
            "queue",
            "Lista de músicas.",
            ["q"],
            "[queue <número da página>]",
            5,
            false,
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
        embed = new RichEmbed();

        bot.getState(msg).player.queue.forEach((req, idx, reqs) => {
            req.music.description;
        });

        bot.api.yt.search(args.join(" "))
            .then(music => {
                return bot.getState(msg).playMusic(msg, music);
            })
            .catch(e => {
                msg.channel.send(customErrorHandler(e));
                console.error(e);
            });
    }
}

module.exports = new Queue();

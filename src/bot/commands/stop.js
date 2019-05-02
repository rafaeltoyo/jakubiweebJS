import { Message } from "discord.js";
import { Jakubiweeb } from "../bot";
import { BaseCommand } from "../command";
import { customErrorHandler } from "../error";

/**
 * Comando <stop>
 * 
 * @author rafaeltoyo
 */
class Stop extends BaseCommand {
    constructor() {
        super(
            "stop",
            "Por hoje é isso amiguinhos.",
            ["bye"],
            "[stop]",
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
     */
    execute(bot, msg) {
        const state = bot.states.getState(msg.guild);
        (async () => { return state.disconnect() })()
            .then(() => {
                msg.reply(":(")
            })
            .catch(error => {
                msg.channel.send(customErrorHandler(error));
            });
    }
}

module.exports = new Stop();

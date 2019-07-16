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
        (async () => { return bot.getState(msg); })()
            .then(state => {
                state.player.stop();

                return (async () => state.leave())()
            })
            .then(() => {
                msg.reply(":(");
            })
            .catch(error => {
                msg.channel.send(customErrorHandler(error));
            });
    }
}

module.exports = new Stop();

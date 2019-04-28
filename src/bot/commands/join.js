import { Message } from "discord.js";
import { Jakubiweeb } from "../bot";
import { BaseCommand } from "../command";
import { customErrorHandler } from "../error";

/**
 * Comando <join>
 * 
 * @author rafaeltoyo
 */
class Join extends BaseCommand {
    constructor() {
        super(
            "join",
            "Tem alguma dúvida? Me chama pra ver esse osciloscôpio.",
            ["summon"],
            "[join]",
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
        state.reconnect(msg)
            .then(conn => {
                msg.reply("Watashi ga Kita!")
            })
            .catch(error => {
                msg.channel.send(customErrorHandler(error));
            });
    }
}

module.exports = new Join();
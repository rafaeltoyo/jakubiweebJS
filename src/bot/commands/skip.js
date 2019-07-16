import * as Discord from "discord.js";
import { Jakubiweeb } from "../bot";
import { BaseCommand } from "../command";
import { customErrorHandler } from "../error";

/**
 * Comando <skip>
 * 
 * @author rafaeltoyo
 */
class Skip extends BaseCommand {
    constructor() {
        super(
            "skip",
            "Pular a música.",
            ["skip"],
            "[skip]",
            5,
            false,
            true,
            true
        );
    }

    /**
     * 
     * @param {Jakubiweeb} bot Contexto da invocação do comando.
     * @param {Discord.Message} msg Mensagem que invocou o comando.
     */
    execute(bot, msg) {
        (async () => { return bot.getState(msg); })()
            .then(state => {
                state.skipMusic();

                const embed = new Discord.RichEmbed();
                embed.setColor(0xc0c0c0);
                embed.setDescription("Skipping ...");
                return msg.channel.send(embed);
            })
            .catch(error => msg.channel.send(customErrorHandler(error)));
    }
}

module.exports = new Skip();

import { Message } from "discord.js";
import { Jakubiweeb } from "../bot";
import { BaseCommand } from "../command";

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
            true
        );
    }

	/**
     * 
     * @param {Jakubiweeb} bot Contexto da invocação do comando.
     * @param {Message} msg Mensagem que invocou o comando.
     */
    execute(bot, msg) {
        msg.channel.send("Pong! :P");
    }
}

module.exports = new Join();

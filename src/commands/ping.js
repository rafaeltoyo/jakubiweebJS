import { Message } from "discord.js";
import { Jakubiweeb } from "./../bot";
import { BaseCommand } from "./../command";

/**
 * Comando <ping>
 * 
 * @author rafaeltoyo
 */
class Ping extends BaseCommand {
	constructor() {
		super(
			"ping",
			"Ping! Pong ...",
			["foo"],
			"[ping]",
			5,
			false,
			false
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

module.exports = new Ping();

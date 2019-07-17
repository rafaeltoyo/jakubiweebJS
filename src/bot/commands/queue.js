import { Message, RichEmbed } from "discord.js";
import { Jakubiweeb } from "../bot";
import { BaseCommand } from "../command";
import { customErrorHandler } from "../error";
import { Music } from "../voice/music";

const N_ITEMS_QUEUE_LIST = 10;

/**
 * =============================================================================
 * Comando <play>
 * -----------------------------------------------------------------------------
 * @author rafaeltoyo
 * =============================================================================
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
        const requester = msg.member;
        const requests = bot.getState(msg).player.queue;
        
        // Number of items
        const numItems = requests.length;
        // Number of pages
        const numPages = Math.ceil(requests.length / N_ITEMS_QUEUE_LIST);
        // Current page
        const numCurrentPage = (args.length > 0)? Math.min(Math.max(args[0], 1), numPages) : 1;

        // Calculate the first item index
        const firstItem = (numCurrentPage - 1) * N_ITEMS_QUEUE_LIST;

        let listText = "";
        requests.slice(firstItem, firstItem + N_ITEMS_QUEUE_LIST).forEach((req, idx, reqs) => {
            const itemId = firstItem + idx + 1;
            if (req.music.status == Music.PLAYING) {
                listText += "`>" + ('000' + itemId).slice(-4) + "<` ";
            }
            else {
                listText += "`[" + ('000' + itemId).slice(-4) + "]` ";
            }

            listText += (req.music.description + '\n');
        });

        listText += "\nPage: `" + ('0' + numCurrentPage).slice(-2) + "`/`" + ('0' + numPages).slice(-2) + "`";

        const embed = new RichEmbed();
        embed.setTitle("Lista de componentes para a APS:");
        embed.setDescription(listText);
        embed.setFooter(requester.displayName, requester.user.displayAvatarURL);
        msg.channel.send(embed);
    }
}

module.exports = new Queue();

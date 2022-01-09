import { MessageEmbed, User } from "discord.js";
import { help_message } from "../../commands/help";
import { DiscordClient } from "../../types";

const DISCORD_PREFIX = process.env.DISCORD_PREFIX;

export default {
    name: "guildMemberAdd",
    async execute(args: any, client: DiscordClient) {
        const embed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("Welcome!!")
            .setDescription(help_message)
            .setTimestamp();
        await args.user.send({
            embeds: [embed],
        });
    },
};

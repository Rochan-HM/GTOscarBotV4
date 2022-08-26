import { EmbedBuilder } from "discord.js";
import { help_message } from "../../commands/help";
import { DiscordClient } from "../../types";

export default {
    name: "guildMemberAdd",
    async execute(args: any, client: DiscordClient) {
        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("Welcome!!")
            .setDescription(help_message)
            .setTimestamp();
        await args.user.send({
            embeds: [embed],
        });
    },
};

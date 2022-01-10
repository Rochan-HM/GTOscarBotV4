import { MessageComponentInteraction, MessageEmbed, Message } from "discord.js";
import { DiscordClient } from "../../types";

export async function sendEmbed({
    message,
    interaction,
    embed,
    client,
}: {
    message?: Message;
    interaction?: MessageComponentInteraction;
    embed: MessageEmbed;
    client: DiscordClient;
}) {
    if (message) {
        await message.author.send({
            embeds: [embed],
        });
    }
    if (interaction) {
        const user = await client.users.fetch(interaction.member!.user.id);

        await user.send({
            embeds: [embed],
        });
    }
}

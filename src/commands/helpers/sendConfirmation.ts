import { MessageComponentInteraction, EmbedBuilder, Message } from "discord.js";

export async function sendConfirmation({
    message,
    interaction,
}: {
    message?: Message;
    interaction?: MessageComponentInteraction;
}) {
    if (message) {
        await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("Done")
                    .setThumbnail(
                        "https://media.giphy.com/media/tf9jjMcO77YzV4YPwE/giphy.gif"
                    )
                    .setDescription(
                        `${message.author} Please check your DM
                    
                    **Update:** Please use **Slash** \`/\` commands for ClassBot.
                    `
                    )
                    .setTimestamp(),
            ],
        });
    }
    if (interaction) {
        console.log("In interaction reply");
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("Done")
                    .setThumbnail(
                        "https://media.giphy.com/media/tf9jjMcO77YzV4YPwE/giphy.gif"
                    )
                    .setDescription(`Please check your DM`)
                    .setTimestamp(),
            ],
            ephemeral: true,
        });
    }
}

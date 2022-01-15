import { MessageComponentInteraction, MessageEmbed } from "discord.js";
import { DiscordClient } from "../../types";

export default {
    name: "interactionCreate",
    async execute(
        interaction: MessageComponentInteraction,
        client: DiscordClient
    ) {
        if (!interaction.isCommand()) return;

        if (!interaction.guild) {
            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setTitle("Sorry!")
                        .setImage(
                            "https://media.giphy.com/media/YuqLrVVVoDK7gqb1Vw/giphy.gif"
                        )
                        .setDescription(
                            "I cannot reply to Personal Messages. Please use the command in the server!"
                        )
                        .setTimestamp(),
                ],
            });
            return;
        }

        const command = client.commands.get(interaction.commandName!);

        if (!command) return;

        try {
            await command.execute_interaction(interaction, client);
        } catch (e) {
            console.error(e);
            return interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    },
};

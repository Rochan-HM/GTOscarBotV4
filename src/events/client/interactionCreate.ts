import {
    ButtonInteraction,
    Interaction,
    MessageComponentInteraction,
} from "discord.js";
import { DiscordClient } from "../../types";

export default {
    name: "interactionCreate",
    async execute(
        interaction: MessageComponentInteraction,
        client: DiscordClient
    ) {
        if (!interaction.isCommand()) return;

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

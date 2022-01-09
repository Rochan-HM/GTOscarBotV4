import { SlashCommandBuilder } from "@discordjs/builders";
import { Message, MessageComponentInteraction, MessageEmbed } from "discord.js";
import { DiscordClient } from "../types";
import { sendConfirmation } from "./helpers/sendConfirmation";

const DISCORD_PREFIX = process.env.DISCORD_PREFIX;
const help_message = `
**BOT COMMANDS**
\`${DISCORD_PREFIX}track CRN xxxxx\` to track a specific CRN.
\`${DISCORD_PREFIX}track CRN xxxxx as Class Name\` to track a specific CRN along with an identifier.
\`${DISCORD_PREFIX}untrack CRN xxxxx\` to untrack a CRN.
\`${DISCORD_PREFIX}status CRN xxxxx\` to get the current status of a CRN.
\`${DISCORD_PREFIX}list\`  or \`!list all\` to list all the classes you are tracking.
\`${DISCORD_PREFIX}help\` to get a list of all commands available.
\`${DISCORD_PREFIX}reset\` to stop tracking all classes.

**EXAMPLES**
\`${DISCORD_PREFIX}track CRN 30925\` to track CRN 30925.
\`${DISCORD_PREFIX}track CRN 30925 as History of Chairs\` to identify the class as "History of Chairs"
\`${DISCORD_PREFIX}untrack CRN 30925\` to stop tracking CRN 30925.
\`${DISCORD_PREFIX}status CRN 30925\` to get the current status of CRN 30925.
`;

export default {
    name: "help",
    aliases: ["commands"],
    description: "Shows the Bot Usage Instructions!",
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Shows the Bot Usage Instructions!"),
    async execute_interaction(
        interaction: MessageComponentInteraction,
        client: DiscordClient
    ) {
        await sendConfirmation(interaction, undefined);

        const user = await client.users.fetch(interaction.member!.user.id);

        await user.send({
            embeds: [
                new MessageEmbed()
                    .setColor("GREEN")
                    .setTitle("Commands")
                    .setDescription(help_message)
                    .setTimestamp(),
            ],
        });
    },
    async execute(client: DiscordClient, message: Message, args: any) {
        await sendConfirmation(undefined, message);

        await message.delete();

        await message.author.send({
            embeds: [
                new MessageEmbed()
                    .setColor("GREEN")
                    .setTitle("Commands")
                    .setDescription(help_message)
                    .setTimestamp(),
            ],
        });
    },
};

export { help_message };

import { MessageEmbed, User } from "discord.js";
import { DiscordClient } from "../../types";

const DISCORD_PREFIX = process.env.DISCORD_PREFIX;
const welcome_msg = `
**BOT COMMANDS**
\`${DISCORD_PREFIX}track CRN xxxxx\` to track a specific CRN.
\`${DISCORD_PREFIX}track CRN xxxxx as Class Name\` to track a specific CRN along with an identifier.
\`${DISCORD_PREFIX}untrack CRN xxxxx\` to untrack a CRN.
\`${DISCORD_PREFIX}status CRN xxxxx\` to get the current status of a CRN.
\`${DISCORD_PREFIX}list\`  or \`!list all\` to list all the classes you are tracking.
\`${DISCORD_PREFIX}help\` to get a list of all commands available.

**EXAMPLES**
\`${DISCORD_PREFIX}track CRN 30925\` to track CRN 30925.
\`${DISCORD_PREFIX}track CRN 30925 as History of Chairs\` to identify the class as "History of Chairs"
\`${DISCORD_PREFIX}untrack CRN 30925\` to stop tracking CRN 30925.
\`${DISCORD_PREFIX}status CRN 30925\` to get the current status of CRN 30925.
`;

export default {
    name: "guildMemberAdd",
    async execute(args: any, client: DiscordClient) {
        const embed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("Welcome!!")
            .setDescription(welcome_msg)
            .setTimestamp();
        await args.user.send({
            embeds: [embed],
        });
    },
};

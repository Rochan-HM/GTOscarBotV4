import { ActivityType } from "discord.js";
import { DiscordClient } from "../../types";

const DISCORD_PREFIX = process.env.DISCORD_PREFIX;

export default {
    name: "ready",
    once: true,
    async execute(client: DiscordClient) {
        console.log(`Bot logged in as ${client?.user?.tag}!`);
        client?.user?.setActivity(`over Classes | ${DISCORD_PREFIX}help`, {
            type: ActivityType.Watching,
        });
    },
};

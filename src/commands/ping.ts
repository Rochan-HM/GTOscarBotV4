import { Message, EmbedBuilder } from "discord.js";
import { DiscordClient } from "../types";

export default {
    name: "ping",
    aliases: ["latency"],
    description: "Checks the Bot and API Latency!",
    async execute(client: DiscordClient, message: Message, args: any) {
        const embed = new EmbedBuilder().setColor("Green").setTitle("Ping");
        const msg = await message.channel.send("Loading data...🤔");
        await msg.delete();
        const latency = `🏓Latency is ${
            msg.createdTimestamp - message.createdTimestamp
        }ms. API Latency is ${Math.round(client.ws.ping)}ms`;
        embed.setDescription(latency).setTimestamp();
        await message.author.send({
            embeds: [embed],
        });
        await message.delete();
    },
};

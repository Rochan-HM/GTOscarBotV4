import { SlashCommandBuilder } from "@discordjs/builders";
import { Message, MessageComponentInteraction, MessageEmbed } from "discord.js";
import { DiscordClient } from "../types";

export default {
    name: "ping",
    aliases: ["latency"],
    description: "Checks the Bot and API Latency!",
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Checks the Bot and API Latency!"),
    async execute_interaction(
        interaction: MessageComponentInteraction,
        client: DiscordClient
    ) {
        await interaction.reply("To be implemented!");
    },
    async execute(client: DiscordClient, message: Message, args: any) {
        const embed = new MessageEmbed().setColor("GREEN").setTitle("Ping");
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

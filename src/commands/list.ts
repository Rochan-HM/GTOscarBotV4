import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import { DiscordClient } from "../types";
import prisma from "../database";
import { SlashCommandBuilder } from "@discordjs/builders";
import { sendConfirmation } from "./helpers/sendConfirmation";
import { sendEmbed } from "./helpers/sendEmbed";

export default {
    name: "list",
    aliases: ["listing", "lists", "listed"],
    description: "Get the current status of a class!",
    data: new SlashCommandBuilder()
        .setName("list")
        .setDescription("Get the current status of a class!"),
    async execute_interaction(
        interaction: CommandInteraction,
        client: DiscordClient
    ) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const crns = await prisma.userTracking.findMany({
                select: {
                    crnId: true,
                    class_alias: true,
                },
                where: {
                    userId: interaction.member!.user.id,
                },
            });

            let msg = "Currently Tracking CRNs\n";
            for (const crn of crns) {
                msg += `${crn.crnId}: ${crn.class_alias}\n`;
            }
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("GREEN")
                        .setTitle("List")
                        .setDescription(msg)
                        .setTimestamp(),
                ],
            });
        } catch (e) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setTitle("Error")
                        .setDescription(
                            "Invalid Message Format or No Class are being tracked!"
                        )
                        .setTimestamp(),
                ],
            });
        }
    },
    async execute(client: DiscordClient, message: Message, args: any) {
        await sendConfirmation({ message });

        try {
            const crns = await prisma.userTracking.findMany({
                select: {
                    crnId: true,
                    class_alias: true,
                },
                where: {
                    userId: message.author.id,
                },
            });

            let msg = "Currently Tracking CRNs\n";
            for (const crn of crns) {
                msg += `${crn.crnId}: ${crn.class_alias}\n`;
            }
            await sendEmbed({
                message,
                embed: new MessageEmbed()
                    .setColor("GREEN")
                    .setTitle("List")
                    .setDescription(msg)
                    .setTimestamp(),
                client,
            });
        } catch (e) {
            await sendEmbed({
                message,
                embed: new MessageEmbed()
                    .setColor("RED")
                    .setTitle("Error")
                    .setDescription(
                        "Invalid Message Format or No Class are being tracked!"
                    )
                    .setTimestamp(),
                client,
            });
        } finally {
            await message.delete();
        }
    },
};

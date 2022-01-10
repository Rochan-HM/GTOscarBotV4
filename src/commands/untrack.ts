import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import prisma from "../database";
import { DiscordClient } from "../types";
import { sendConfirmation } from "./helpers/sendConfirmation";
import { sendEmbed } from "./helpers/sendEmbed";

export default {
    name: "untrack",
    aliases: ["untracking", "untracked", "untracks"],
    description: "Stop tracking a particular class!",
    data: new SlashCommandBuilder()
        .setName("untrack")
        .setDescription("Stop tracking a particular class!")
        .addIntegerOption((option) =>
            option
                .setName("crn")
                .setRequired(true)
                .setDescription("The CRN of the class you want to track")
                .setAutocomplete(false)
                .setMinValue(0)
                .setMaxValue(99999)
        ),
    async execute_interaction(
        interaction: CommandInteraction,
        client: DiscordClient
    ) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const userId = interaction.member!.user.id;
            const crn = interaction.options.getInteger("crn");

            if (!crn) {
                throw new Error("CRN is required");
            }

            const course = await prisma.userTracking.findFirst({
                where: {
                    userId,
                    crnId: crn,
                },
                select: {
                    user_tracking_id: true,
                },
            });

            if (!course) {
                throw new Error("Course is not being tracked!");
            }

            await prisma.userTracking.delete({
                where: {
                    user_tracking_id: course.user_tracking_id,
                },
            });

            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("GREEN")
                        .setTitle("Untrack")
                        .setDescription(`Stopped tracking CRN ${crn}!`)
                        .setTimestamp(),
                ],
            });
        } catch (e) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setTitle("Error")
                        .setDescription(e.message)
                        .setTimestamp(),
                ],
            });
        }
    },
    async execute(client: DiscordClient, message: Message, args: any) {
        await sendConfirmation({ message });

        try {
            let exp, m, crn, userId;
            // Admin user
            if (message.author.id === process.env.ADMIN_ID!) {
                exp = /crn (\d+).?(sudo)?.?(\w+)?/gi;
                m = exp.exec(message.content);

                if (!m || !m[1]) {
                    throw new Error("Invalid Message Format");
                }

                crn = +m[1];
                if (m[2]) {
                    userId = m[3];
                } else {
                    userId = message.author.id;
                }
            }
            // Else normal message
            else {
                exp = /crn (\d+)/gi;
                m = exp.exec(message.content);

                if (!m || !m[1]) {
                    throw new Error("Invalid Message Format");
                }

                crn = +m[1];
            }

            const course = await prisma.userTracking.findFirst({
                where: {
                    userId,
                    crnId: crn,
                },
                select: {
                    user_tracking_id: true,
                },
            });

            if (!course) {
                throw new Error("Course is not being tracked!");
            }

            await prisma.userTracking.delete({
                where: {
                    user_tracking_id: course.user_tracking_id,
                },
            });

            await sendEmbed({
                message,
                client,
                embed: new MessageEmbed()
                    .setColor("GREEN")
                    .setTitle("Untrack")
                    .setDescription(`Stopped tracking CRN ${crn}!`)
                    .setTimestamp(),
            });
        } catch (e) {
            await sendEmbed({
                message,
                client,
                embed: new MessageEmbed()
                    .setColor("RED")
                    .setTitle("Error")
                    .setDescription(e.message)
                    .setTimestamp(),
            });
        } finally {
            await message.delete();
        }
    },
};

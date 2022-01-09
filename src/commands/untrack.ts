import { SlashCommandBuilder } from "@discordjs/builders";
import { Message, MessageComponentInteraction, MessageEmbed } from "discord.js";
import prisma from "../database";
import { DiscordClient } from "../types";

export default {
    name: "untrack",
    aliases: ["untracking", "untracked", "untracks"],
    description: "Stop tracking a particular class!",
    data: new SlashCommandBuilder()
        .setName("untrack")
        .setDescription("Stop tracking a particular class!"),
    async execute_interaction(
        interaction: MessageComponentInteraction,
        client: DiscordClient
    ) {
        await interaction.reply("To be implemented!");
    },
    async execute(client: DiscordClient, message: Message, args: any) {
        const done_embed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("Done")
            .setThumbnail(
                "https://media.giphy.com/media/tf9jjMcO77YzV4YPwE/giphy.gif"
            )
            .setDescription(`${message.author} Please check your DM`)
            .setTimestamp();
        await message.reply({
            embeds: [done_embed],
        });

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

            const embed = new MessageEmbed()
                .setColor("GREEN")
                .setTitle("Untrack")
                .setDescription(`Stopped tracking CRN ${crn}!`)
                .setTimestamp();
            await message.author.send({
                embeds: [embed],
            });

            await message.delete();
        } catch (e) {
            const embed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Error")
                .setDescription(e.message)
                .setTimestamp();
            await message.author.send({
                embeds: [embed],
            });
            await message.delete();
        }
    },
};

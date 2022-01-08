import { Message, MessageEmbed } from "discord.js";
import prisma from "../database";
import { DiscordClient } from "../types";

export default {
    name: "untrack",
    aliases: ["untracking", "untracked", "untracks"],
    description: "Get the current status of a class!",
    async execute(client: DiscordClient, message: Message, args: any) {
        const done_embed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("Done")
            .setThumbnail(
                "https://media.giphy.com/media/tf9jjMcO77YzV4YPwE/giphy.gif"
            )
            .setDescription(`${message.author} Please check your DM`);
        await message.reply({
            embeds: [done_embed],
        });

        try {
            let exp, m, crn, userId;
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
                .setDescription(`Stopped tracking CRN ${crn}!`);
            await message.author.send({
                embeds: [embed],
            });

            await message.delete();

            // Clean up database if no other user is tracking the same course
            const remaining_users = await prisma.userTracking.count({
                where: {
                    crnId: crn,
                },
            });
            if (remaining_users === 0) {
                await prisma.cRN.delete({
                    where: {
                        crn_id: crn,
                    },
                });
            }
        } catch (e) {
            const embed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Error")
                .setDescription(e.message);
            await message.author.send({
                embeds: [embed],
            });
            await message.delete();
        }
    },
};

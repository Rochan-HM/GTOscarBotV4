import { SlashCommandBuilder } from "@discordjs/builders";
import { Message, MessageComponentInteraction, MessageEmbed } from "discord.js";
import prisma from "../database";
import { scrape } from "../scraper";
import { DiscordClient } from "../types";

export default {
    name: "reset",
    aliases: [],
    description: "Reset to stop tracking all classes!",
    data: new SlashCommandBuilder()
        .setName("reset")
        .setDescription("Reset to stop tracking all classes!"),
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
            // If admin message
            let exp, m, userId;
            if (message.author.id === process.env.ADMIN_ID!) {
                exp = /(sudo)?.?(\w+)/gi;
                m = exp.exec(message.content);

                if (m && m[1] && m[2]) {
                    userId = m[2];
                } else {
                    userId = message.author.id;
                }
            }
            // Else normal message
            else {
                userId = message.author.id;
            }

            const removedCourses = await prisma.userTracking.deleteMany({
                where: {
                    userId,
                },
            });

            console.log(removedCourses);

            const embed = new MessageEmbed()
                .setColor("GREEN")
                .setTitle("Track")
                .setDescription(
                    `Successfully untracked ${removedCourses.count} course(s)`
                )
                .setTimestamp();
            await message.author.send({
                embeds: [embed],
            });
        } catch (err) {
            console.error(`[reset.js] Unable to reset.`);
            const embed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Error")
                .setDescription(
                    "Sorry! Something went wrong! Please try again!"
                )
                .setTimestamp();
            await message.author.send({
                embeds: [embed],
            });
        } finally {
            await message.delete();
        }
    },
};

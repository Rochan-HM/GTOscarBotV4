import { Message, MessageEmbed } from "discord.js";
import { DiscordClient } from "../types";
import prisma from "../database";

export default {
    name: "list",
    aliases: ["listing", "lists", "listed"],
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
            const embed = new MessageEmbed()
                .setColor("GREEN")
                .setTitle("List")
                .setDescription(msg);
            await message.author.send({
                embeds: [embed],
            });
        } catch (e) {
            const embed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Error")
                .setDescription(
                    "Invalid Message Format or No Class are being tracked!"
                );
            await message.author.send({
                embeds: [embed],
            });
        } finally {
            await message.delete();
        }
    },
};

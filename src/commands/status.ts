import { Message, MessageEmbed } from "discord.js";
import prisma from "../database";
import { DiscordClient } from "../types";

export default {
    name: "status",
    aliases: ["statusing"],
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
            const exp = /crn (\d+)/gi;
            const m = exp.exec(message.content);
            if (!m || !m[1]) {
                throw new Error(
                    "Invalid Message Format or No Class are being tracked!"
                );
            }
            const crn = +m[1];
            const course = await prisma.cRN.findFirst({
                where: {
                    crn_id: crn,
                },
                select: {
                    class_name: true,
                    class_seats: true,
                    waitlist_seats: true,
                },
            });
            if (!course) {
                throw new Error("Invalid CRN");
            }

            const msg = `Status of CRN ${crn} - ${course.class_name}: 
            
            Class Seats: ${course.class_seats} ${
                course.class_seats >= 1 ? "(Open)" : "(Closed)"
            }
            Waitlist Seats: ${course.waitlist_seats} ${
                course.waitlist_seats >= 1 ? "(Open)" : "(Closed)"
            }`;

            const embed = new MessageEmbed()
                .setColor("GREEN")
                .setTitle("Status")
                .setDescription(msg);
            await message.author.send({
                embeds: [embed],
            });
        } catch (e) {
            const embed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Error")
                .setDescription(
                    "Invalid Message Format or Class is not being tracked. Track it first to get current status!"
                );
            await message.author.send({
                embeds: [embed],
            });
        } finally {
            await message.delete();
        }
    },
};

import { SlashCommandBuilder } from "@discordjs/builders";
import {
    CommandInteraction,
    Message,
    MessageComponentInteraction,
    MessageEmbed,
} from "discord.js";
import prisma from "../database";
import { DiscordClient } from "../types";
import { sendConfirmation } from "./helpers/sendConfirmation";
import { sendEmbed } from "./helpers/sendEmbed";

export default {
    name: "status",
    aliases: [],
    description: "Get the current status of a class!",
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Get the current status of a class!")
        .addIntegerOption((option) =>
            option
                .setName("crn")
                .setRequired(true)
                .setDescription(
                    "The CRN of the class you want to check the status of"
                )
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
            const crn = interaction.options.getInteger("crn");

            if (!crn) {
                throw new Error("CRN is required");
            }

            const course = await prisma.cRN.findFirst({
                where: {
                    crn_id: crn,
                    UserTracking: {
                        every: {
                            userId: interaction.member?.user.id,
                        },
                    },
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

            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("GREEN")
                        .setTitle("Status")
                        .setDescription(msg)
                        .setTimestamp(),
                ],
                components: [],
            });
        } catch (e) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setTitle("Error")
                        .setDescription(
                            "Invalid Message Format or Class is not being tracked. Track it first to get current status!"
                        )
                        .setTimestamp(),
                ],
                components: [],
            });
        }
    },
    async execute(client: DiscordClient, message: Message, args: any) {
        await sendConfirmation({ message });

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

            await sendEmbed({
                message,
                embed: new MessageEmbed()
                    .setColor("GREEN")
                    .setTitle("Status")
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
                        "Invalid Message Format or Class is not being tracked. Track it first to get current status!"
                    )
                    .setTimestamp(),
                client,
            });
        } finally {
            await message.delete();
        }
    },
};

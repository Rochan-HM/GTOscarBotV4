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
        .setDescription("Get the current status of a class!")
        .addStringOption((option) =>
            option
                .setName("filter")
                .setDescription("Filter classes by")
                .setRequired(true)
                .addChoice("All Courses", "all")
                .addChoice("Open Courses", "open")
                .addChoice("Closed Courses", "closed")
                .addChoice("Waitlist Open Courses", "waitlist open")
                .addChoice("Waitlist Closed Courses", "waitlist closed")
        ),
    async execute_interaction(
        interaction: CommandInteraction,
        client: DiscordClient
    ) {
        await interaction.deferReply({ ephemeral: true });

        try {
            let filter = interaction.options.getString("filter");
            interaction.options.getString;
            if (!filter) {
                filter = "all";
            }

            let crns;
            switch (filter) {
                case "open":
                    crns = await prisma.userTracking.findMany({
                        select: {
                            crnId: true,
                            class_alias: true,
                        },
                        where: {
                            userId: interaction.member!.user.id,
                            CRN: {
                                class_seats: {
                                    gt: 0,
                                },
                            },
                        },
                    });
                    break;

                case "closed":
                    crns = await prisma.userTracking.findMany({
                        select: {
                            crnId: true,
                            class_alias: true,
                        },
                        where: {
                            userId: interaction.member!.user.id,
                            CRN: {
                                class_seats: {
                                    equals: 0,
                                },
                            },
                        },
                    });
                    break;

                case "waitlist open":
                    crns = await prisma.userTracking.findMany({
                        select: {
                            crnId: true,
                            class_alias: true,
                        },
                        where: {
                            userId: interaction.member!.user.id,
                            CRN: {
                                waitlist_seats: {
                                    gt: 0,
                                },
                            },
                        },
                    });
                    break;

                case "waitlist closed":
                    crns = await prisma.userTracking.findMany({
                        select: {
                            crnId: true,
                            class_alias: true,
                        },
                        where: {
                            userId: interaction.member!.user.id,
                            CRN: {
                                waitlist_seats: {
                                    equals: 0,
                                },
                            },
                        },
                    });
                    break;

                default:
                    crns = await prisma.userTracking.findMany({
                        select: {
                            crnId: true,
                            class_alias: true,
                        },
                        where: {
                            userId: interaction.member!.user.id,
                        },
                    });
                    break;
            }

            let msg = "Courses \n";
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
                        .setDescription("Invalid Message Format!")
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

            let msg = "Currently Tracking Courses\n";
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

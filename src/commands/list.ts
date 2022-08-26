import { Message, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { DiscordClient } from "../types";
import prisma from "../database";
import { SlashCommandBuilder } from "@discordjs/builders";
import { sendConfirmation } from "./helpers/sendConfirmation";
import { sendEmbed } from "./helpers/sendEmbed";

export default {
    name: "list",
    aliases: [],
    description: "Get the current status of a class!",
    data: new SlashCommandBuilder()
        .setName("list")
        .setDescription("Get the current status of a class!")
        .addStringOption((option) =>
            option
                .setName("filter")
                .setDescription("Filter classes by")
                .setRequired(true)
                .addChoices(
                    { name: "All Courses", value: "all" },
                    { name: "Open Courses", value: "open" },
                    { name: "Closed Courses", value: "closed" },
                    { name: "Waitlist Open Courses", value: "waitlist open" },
                    {
                        name: "Waitlist Closed Courses",
                        value: "waitlist closed",
                    }
                )
        ),
    async execute_interaction(
        interaction: ChatInputCommandInteraction,
        client: DiscordClient
    ) {
        await interaction.deferReply({ ephemeral: true });

        try {
            let filter = interaction.options.getString("filter");
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

            let msg;
            if (crns.length === 0) {
                msg = "No courses meet your criteria!";
            } else {
                msg = `${crns.length} Courses \n`;
                for (const crn of crns) {
                    msg += `${crn.crnId}: ${crn.class_alias}\n`;
                }
            }

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("List")
                        .setDescription(msg)
                        .setTimestamp(),
                ],
            });
        } catch (e) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
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
                embed: new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("List")
                    .setDescription(msg)
                    .setTimestamp(),
                client,
            });
        } catch (e) {
            await sendEmbed({
                message,
                embed: new EmbedBuilder()
                    .setColor("Red")
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

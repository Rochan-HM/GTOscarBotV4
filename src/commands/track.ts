import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import prisma from "../database";
import { scrape } from "../scraper";
import { DiscordClient } from "../types";
import { sendConfirmation } from "./helpers/sendConfirmation";
import { sendEmbed } from "./helpers/sendEmbed";

export default {
    name: "track",
    aliases: [],
    description: "Track a new class!",
    data: new SlashCommandBuilder()
        .setName("track")
        .setDescription("Track a new class!")
        .addIntegerOption((option) =>
            option
                .setName("crn")
                .setRequired(true)
                .setDescription("The CRN of the class you want to track")
                .setAutocomplete(false)
                .setMinValue(0)
                .setMaxValue(99999)
        )
        .addStringOption((option) =>
            option
                .setName("alias")
                .setDescription(
                    "Optionally, provide a custom name for the class"
                )
                .setRequired(false)
        ),
    async execute_interaction(
        interaction: CommandInteraction,
        client: DiscordClient
    ) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const crn = interaction.options.getInteger("crn");
            const userId = interaction.member?.user.id!;
            const userName = interaction.member?.user.username!;

            if (!crn) {
                throw new Error("CRN is required");
            }

            const {
                class_seats: c_seats,
                wl_seats: w_seats,
                og_name: c_name,
            } = await scrape(crn);
            if (!c_seats || !w_seats || !c_name) {
                console.log(
                    `[database] Error adding CRN ${crn} -> Got ${c_seats} Class | ${w_seats} Waitlist`
                );
                throw new Error("Invalid CRN or OSCAR Error!");
            }
            const class_seats = +c_seats;
            const wl_seats = +w_seats;

            // Update alias
            const alias = interaction.options.getString("alias") || c_name;

            const user = await prisma.user.upsert({
                where: {
                    id: userId,
                },
                create: {
                    id: userId,
                    name: userName,
                    total_tracked_crns: 0,
                },
                update: {
                    name: userName,
                },
            });

            const course = await prisma.userTracking.findFirst({
                where: {
                    userId: user.id,
                    crnId: crn,
                },
            });

            if (course) {
                throw new Error("Class is already being tracked!");
            }

            await prisma.$transaction([
                prisma.userTracking.create({
                    data: {
                        class_alias: alias,
                        guild_id: interaction.guildId || "Unknown",
                        guild_name: interaction.guild?.name || "Unknown",
                        CRN: {
                            connectOrCreate: {
                                where: {
                                    crn_id: crn,
                                },
                                create: {
                                    crn_id: crn,
                                    class_name: c_name,
                                    class_seats,
                                    waitlist_seats: wl_seats,
                                },
                            },
                        },
                        User: {
                            connect: {
                                id: user.id,
                            },
                        },
                    },
                }),
                prisma.user.update({
                    data: {
                        total_tracked_crns: {
                            increment: 1,
                        },
                    },
                    where: {
                        id: user.id,
                    },
                }),
            ]);

            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("GREEN")
                        .setTitle("Track")
                        .setDescription(
                            `Successfully tracking ${alias}: CRN ${crn}
                
                **Status:**
                Class Seats: ${class_seats}
                Waitlist Seats: ${wl_seats}
                `
                        )
                        .setTimestamp(),
                ],
            });
        } catch (err) {
            console.error(`[Track] Unable to track class. Error ${err}`);
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setTitle("Error")
                        .setDescription(err.message)
                        .setTimestamp(),
                ],
            });
        }
    },
    async execute(client: DiscordClient, message: Message, args: any) {
        await sendConfirmation({ message });

        try {
            // If admin message
            let exp, m, crn, alias, userId, userName;
            if (message.author.id === process.env.ADMIN_ID!) {
                exp = /crn (\d+).?(sudo)?.?(\w+)?.?(as)?.?(.+)?/gi;
                m = exp.exec(message.content);

                if (!m || !m[1]) {
                    throw new Error("Invalid Message Format!");
                }

                crn = +m[1];
                if (m[2]) {
                    userId = m[3];
                    userName = await client.users.fetch(userId);
                    userName = userName.username;
                } else {
                    userId = message.author.id;
                    userName = message.author.username;
                }
                alias = m[5] ? m[5].trim() : "";
            }
            // Else normal message
            else {
                exp = /crn (\d+).?(as)?.?(.+)?/gi;
                m = exp.exec(message.content);

                if (!m || !m[1]) {
                    throw new Error("Invalid Message Format!");
                }

                crn = +m[1];
                alias = m[3] ? m[3].trim() : "";
                userId = message.author.id;
                userName = message.author.username;
            }

            const {
                class_seats: c_seats,
                wl_seats: w_seats,
                og_name: c_name,
            } = await scrape(crn);
            if (!c_seats || !w_seats || !c_name) {
                console.log(
                    `[database] Error adding CRN ${crn} -> Got ${c_seats} Class | ${w_seats} Waitlist`
                );
                throw new Error("Invalid CRN or OSCAR Error!");
            }
            const class_seats = +c_seats;
            const wl_seats = +w_seats;

            // Update alias
            alias = alias || c_name;

            const user = await prisma.user.upsert({
                where: {
                    id: userId,
                },
                create: {
                    id: userId,
                    name: userName,
                    total_tracked_crns: 0,
                },
                update: {
                    name: userName,
                },
            });

            const course = await prisma.userTracking.findFirst({
                where: {
                    userId: user.id,
                    crnId: crn,
                },
            });

            if (course) {
                throw new Error("Class is already being tracked!");
            }

            await prisma.$transaction([
                prisma.userTracking.create({
                    data: {
                        class_alias: alias,
                        guild_id: message.guildId || "Unknown",
                        guild_name: message.guild?.name || "Unknown",
                        CRN: {
                            connectOrCreate: {
                                where: {
                                    crn_id: crn,
                                },
                                create: {
                                    crn_id: crn,
                                    class_name: c_name,
                                    class_seats,
                                    waitlist_seats: wl_seats,
                                },
                            },
                        },
                        User: {
                            connect: {
                                id: user.id,
                            },
                        },
                    },
                }),
                prisma.user.update({
                    data: {
                        total_tracked_crns: {
                            increment: 1,
                        },
                    },
                    where: {
                        id: user.id,
                    },
                }),
            ]);

            await sendEmbed({
                message,
                client,
                embed: new MessageEmbed()
                    .setColor("GREEN")
                    .setTitle("Track")
                    .setDescription(
                        `Successfully tracking ${alias}: CRN ${crn}
                
                **Status:**
                Class Seats: ${class_seats}
                Waitlist Seats: ${wl_seats}
                `
                    )
                    .setTimestamp(),
            });
        } catch (err) {
            console.error(`[Track] Unable to track class. Error ${err}`);
            await sendEmbed({
                message,
                client,
                embed: new MessageEmbed()
                    .setColor("RED")
                    .setTitle("Error")
                    .setDescription(err.message)
                    .setTimestamp(),
            });
        } finally {
            await message.delete();
        }
    },
};

import { Message, MessageEmbed } from "discord.js";
import prisma from "../database";
import { scrape } from "../scraper";
import { DiscordClient } from "../types";

export default {
    name: "track",
    aliases: ["tracking", "tracks", "tracked"],
    description: "Track a new class!",
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

            const embed = new MessageEmbed()
                .setColor("GREEN")
                .setTitle("Track")
                .setDescription(`Successfully tracking ${alias}: CRN ${crn}`);
            await message.author.send({
                embeds: [embed],
            });
        } catch (err) {
            console.error(`[track.js] Unable to track class. Error ${err}`);
            const embed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Error")
                .setDescription(err.message);
            await message.author.send({
                embeds: [embed],
            });
        } finally {
            await message.delete();
        }
    },
};

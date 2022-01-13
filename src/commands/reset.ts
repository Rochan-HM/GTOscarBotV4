import { SlashCommandBuilder } from "@discordjs/builders";
import {
    CommandInteraction,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
} from "discord.js";
import prisma from "../database";
import { DiscordClient } from "../types";
import { sendConfirmation } from "./helpers/sendConfirmation";
import { sendEmbed } from "./helpers/sendEmbed";

export default {
    name: "reset",
    aliases: ["format"],
    description: "Reset to stop tracking all classes!",
    data: new SlashCommandBuilder()
        .setName("reset")
        .setDescription("Reset to stop tracking all classes!"),
    async execute_interaction(
        interaction: CommandInteraction,
        client: DiscordClient
    ) {
        const confirmation = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("confirm")
                .setLabel("Reset")
                .setStyle("DANGER"),
            new MessageButton()
                .setCustomId("cancel")
                .setLabel("Cancel")
                .setStyle("SECONDARY")
        );

        await interaction.reply({
            content: "Are you sure you want to reset and untrack all courses?",
            components: [confirmation],
            ephemeral: true,
        });

        const collector = interaction.channel?.createMessageComponentCollector({
            max: 1,
            time: 1000 * 15,
        });

        collector?.on("end", async (collection) => {
            if (collection.first()?.customId === "confirm") {
                try {
                    const removedCourses = await prisma.userTracking.deleteMany(
                        {
                            where: {
                                userId: interaction.member!.user.id,
                            },
                        }
                    );

                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("GREEN")
                                .setTitle("Reset")
                                .setDescription(
                                    `Successfully untracked ${removedCourses.count} course(s)`
                                )
                                .setTimestamp(),
                        ],
                        components: [],
                    });
                } catch (e) {
                    console.error(`[Reset] Unable to reset.`);
                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setTitle("Error")
                                .setDescription(
                                    "Sorry! Something went wrong! Please try again!"
                                )
                                .setTimestamp(),
                        ],
                        components: [],
                    });
                }
            } else if (collection.first()?.customId === "cancel") {
                await interaction.editReply({
                    content: "Cancelled",
                    components: [],
                });
                return;
            } else {
                await interaction.editReply({
                    content: "Operation Expired! Please try again",
                    components: [],
                });
            }
        });
    },
    async execute(client: DiscordClient, message: Message, args: any) {
        await sendConfirmation({ message });

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

            await sendEmbed({
                message,
                embed: new MessageEmbed()
                    .setColor("GREEN")
                    .setTitle("Reset")
                    .setDescription(
                        `Successfully untracked ${removedCourses.count} course(s)`
                    )
                    .setTimestamp(),
                client,
            });
        } catch (err) {
            console.error(`[Reset] Unable to reset.`);
            await sendEmbed({
                message,
                embed: new MessageEmbed()
                    .setColor("RED")
                    .setTitle("Error")
                    .setDescription(
                        "Sorry! Something went wrong! Please try again!"
                    )
                    .setTimestamp(),
                client,
            });
        } finally {
            await message.delete();
        }
    },
};

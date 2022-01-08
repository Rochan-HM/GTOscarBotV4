import { MessageEmbed } from "discord.js";
import prisma from "./database";
import { DiscordClient } from "./types";

export default async (client: DiscordClient, msg: string, crn: number) => {
    const users = await prisma.userTracking.findMany({
        select: {
            userId: true,
            crnId: true,
            class_alias: true,
            CRN: {
                select: {
                    class_seats: true,
                    waitlist_seats: true,
                },
            },
        },
        where: {
            crnId: crn,
        },
    });

    for (const user of users) {
        const colorCode = msg.includes("Open") ? "GREEN" : "RED";
        const description = `${user.class_alias}
        
        **Last Tracked Status:**
        Class Seats: ${user.CRN?.class_seats}
        Waitlist Seats: ${user.CRN?.waitlist_seats}
        `;
        const embed = new MessageEmbed()
            .setColor(colorCode)
            .setTitle(msg)
            .setDescription(description)
            .setTimestamp();
        const discordUser = await client.users.fetch(user.userId!);
        await discordUser.send({
            embeds: [embed],
        });
        console.log(
            `[Notifier] Message sent to ${discordUser.username} -> ${msg} | ${user.class_alias}`
        );
    }
};

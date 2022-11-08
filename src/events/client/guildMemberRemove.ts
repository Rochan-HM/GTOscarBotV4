import { User } from "discord.js";
import prisma from "../../database";
import { DiscordClient } from "../../types";

export default {
  name: "guildMemberRemove",
  async execute(member: User, client: DiscordClient) {
    try {
      await prisma.user.delete({
        where: {
          id: member.id,
        },
      });
    } catch (e) {
      console.error(e.message);
    }
  },
};

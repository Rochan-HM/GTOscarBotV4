import { Message, EmbedBuilder, ChannelType } from "discord.js";
import { DiscordClient } from "../../types";

const DISCORD_PREFIX = process.env.DISCORD_PREFIX!;

export default {
  name: "message",
  async execute(message: Message, client: DiscordClient) {
    if (message.channel.type === ChannelType.DM && !message.author.bot) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Sorry!")
        .setImage("https://media.giphy.com/media/YuqLrVVVoDK7gqb1Vw/giphy.gif")
        .setDescription(
          "I cannot reply to Personal Messages. Please use the command in the server!"
        )
        .setTimestamp();
      await message.channel.send({
        embeds: [embed],
      });
      return;
    }

    if (!message.content.startsWith(DISCORD_PREFIX) || message.author.bot) {
      return;
    }

    const args = message.content
      .slice(DISCORD_PREFIX.length)
      .trim()
      .split(/ +/);
    const commandName = args.shift()?.toLowerCase() || "";

    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        (cmd: any) => cmd.aliases && cmd.aliases.includes(commandName)
      );

    if (!command) {
      const done_embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Invalid Command")
        .setThumbnail(
          "https://media.giphy.com/media/YuqLrVVVoDK7gqb1Vw/giphy.gif"
        )
        .setDescription(`${message.author} Invalid Command.`)
        .setTimestamp();
      await message.reply({
        embeds: [done_embed],
      });
      await message.delete();

      return;
    }

    try {
      command.execute(client, message, args);
    } catch (error) {
      console.error(error);
    }
  },
};

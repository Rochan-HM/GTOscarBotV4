import { DiscordClient } from "../types";
import fs from "fs";
import path from "path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

export async function execute(client: DiscordClient) {
    const commands = [];
    const commandFiles = fs
        .readdirSync(path.resolve(__dirname, "..", "commands"))
        .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

    for (const file of commandFiles) {
        let command = await import(
            path.resolve(__dirname, "..", "commands", file)
        );
        if (command.default.data) {
            commands.push(command.default.data.toJSON());
        }
    }

    const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

    (async () => {
        try {
            console.log("Started refreshing application (/) commands.");

            await rest.put(
                // Routes.applicationCommands(process.env.BOT_CLIENT_ID!),
                Routes.applicationGuildCommands(
                    process.env.BOT_CLIENT_ID!,
                    "826117242768195625"
                ),
                {
                    body: commands,
                }
            );

            console.log("Successfully reloaded application (/) commands.");
        } catch (error) {
            console.error(error);
        }
    })();
}

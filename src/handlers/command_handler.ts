import fs from "fs";
import path from "path";
import { DiscordClient } from "../types";

export async function execute(client: DiscordClient) {
  const commandFiles = fs
    .readdirSync(path.resolve(__dirname, "..", "commands"))
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

  for (const file of commandFiles) {
    let command = await import(path.resolve(__dirname, "..", "commands", file));
    command = command.default;
    if (command.name) {
      client.commands.set(command.name, command);
    } else {
      continue;
    }
  }
}

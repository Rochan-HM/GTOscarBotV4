import fs from "fs";
import path from "path";
import { DiscordClient } from "../types";

export async function execute(client: DiscordClient) {
    const load_dir = async (dir: string) => {
        const event_files = fs
            .readdirSync(path.resolve(__dirname, "..", "events", dir))
            .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

        for (const file of event_files) {
            let event = await import(
                path.resolve(__dirname, "..", "events", dir, file)
            );
            event = event.default;
            const event_name = file.split(".")[0];
            if (event.once) {
                client.once(event_name, (...args) =>
                    event.execute(...args, client)
                );
            } else {
                client.on(event_name, (...args) =>
                    event.execute(...args, client)
                );
            }
        }
    };

    ["client", "guild"].forEach(async (e) => await load_dir(e));
}

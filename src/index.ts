import { Client, Collection, Partials } from "discord.js";
import { fork } from "child_process";
import path from "path";
import dotenv from "dotenv";
import * as timer from "node:timers/promises";

import { DiscordClient, Message } from "./types";
import notifier from "./notifier";
import cleaner from "./cleaner";

dotenv.config();

const main = async () => {
    const envs = [
        "DATABASE_URL",
        "DISCORD_TOKEN",
        "DISCORD_PREFIX",
        "SLEEP_TIME",
        "OSCAR_URL",
        "PAUSED",
        "CONCURRENCY",
        "ADMIN_ID",
        "BOT_CLIENT_ID",
    ];

    for (const env of envs) {
        if (!process.env[env]) {
            console.error(`${env} is not set`);
            process.exit(1);
        }
    }

    const PAUSED = +process.env.PAUSED!;

    const client = new Client({
        intents: [
            "Guilds",
            "GuildMembers",
            "GuildPresences",
            "GuildMessages",
            "GuildMessageTyping",
            "GuildEmojisAndStickers",
            "DirectMessages",
            "DirectMessageTyping",
        ],
        partials: [Partials.Channel],
    }) as DiscordClient;

    client.commands = new Collection();
    client.events = new Collection();

    try {
        ["command_register", "command_handler", "event_handler"].forEach(
            async (handler) => {
                const hlr = await import(
                    path.resolve(__dirname, "handlers", `${handler}`)
                );
                hlr.execute(client);
            }
        );

        await client.login(process.env.DISCORD_TOKEN!);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }

    if (PAUSED) {
        console.log("Tracker is paused");
        return;
    }

    // Start cleaner daemon
    cleaner();

    // Start OSCAR daemon
    const worker = fork(path.resolve(__dirname, "worker"));
    console.log("Launching worker child fork");

    // Get the sleep time between successive fetches
    const SLEEP_TIME = +process.env.SLEEP_TIME!;
    const sleep = (ms: number) => timer.setTimeout(ms);

    worker.send("start");
    worker.on("message", async (msg: Message) => {
        const { update, message, crn } = msg;
        if (!update) {
            await sleep(SLEEP_TIME);
            console.log(`${message} => Relaunching worker child fork...`);
            worker.send("start");
        } else {
            notifier(client, message, crn);
        }
    });
};

main();

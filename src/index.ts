import { Client, Collection } from "discord.js";
import { fork } from "child_process";
import notifier from "./notifier";
import { DiscordClient, Message } from "./types";
import path from "path";
require("dotenv").config();

const envs = [
    "DATABASE_URL",
    "DISCORD_TOKEN",
    "DISCORD_PREFIX",
    "SLEEP_TIME",
    "SUCCESS",
    "FAILURE",
    "OSCAR_URL",
    "PAUSED",
    "CONCURRENCY",
    "ADMIN_ID",
];

for (const env of envs) {
    if (!process.env[env]) {
        console.error(`${env} is not set`);
        process.exit(1);
    }
}

const client = new Client({
    intents: [
        "GUILDS",
        "GUILD_MEMBERS",
        "GUILD_PRESENCES",
        "GUILD_MESSAGES",
        "GUILD_MESSAGE_TYPING",
        "GUILD_EMOJIS_AND_STICKERS",
        "DIRECT_MESSAGES",
        "DIRECT_MESSAGE_TYPING",
    ],
}) as DiscordClient;

client.commands = new Collection();
client.events = new Collection();

["command_handler", "event_handler"].forEach(async (handler) => {
    const hlr = await import(path.resolve(__dirname, "handlers", `${handler}`));
    hlr.execute(client);
});

client.login(process.env.DISCORD_TOKEN!);

if (!process.env.isPaused!) {
    const worker = fork(path.resolve(__dirname, "worker"));
    console.log("Launching worker child fork");
    worker.send("start");
    worker.on("message", (msg: Message) => {
        const { update, message, crn } = msg;
        if (!update) {
            console.log(`${message} => Relaunching worker child fork...`);
            worker.send("start");
        } else {
            notifier(client, message, crn);
        }
    });
}

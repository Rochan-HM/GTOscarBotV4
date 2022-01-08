import { Client, Collection } from "discord.js";

export interface Message {
    update: boolean;
    message: string;
    crn: number;
}

export interface DiscordClient extends Client {
    commands: Collection<string, any>;
    events: Collection<string, any>;
}

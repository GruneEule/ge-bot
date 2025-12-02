import type { Client, ClientEvents as DiscordClientEvents } from 'discord.js';

// Die Basisstruktur für jedes Event
export interface Event<T extends keyof DiscordClientEvents> {
    // Der Name des Events (z.B. 'guildMemberAdd', 'messageCreate')
    name: T;
    // Soll das Event nur einmal ausgeführt werden? (z.B. 'ready')
    once?: boolean;
    // Die Funktion, die ausgeführt wird, wenn das Event eintritt
    execute: (client: Client, ...args: DiscordClientEvents[T]) => Promise<void> | void;
}

// Export the type for use in other files
export type { DiscordClientEvents as ClientEvents };
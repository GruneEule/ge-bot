import type { Client, ClientEvents as DiscordClientEvents } from 'discord.js';
export interface Event<T extends keyof DiscordClientEvents> {
    name: T;
    once?: boolean;
    execute: (client: Client, ...args: DiscordClientEvents[T]) => Promise<void> | void;
}
export type { DiscordClientEvents as ClientEvents };
//# sourceMappingURL=Event.d.ts.map
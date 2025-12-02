import type { ChatInputApplicationCommandData, CommandInteraction, Client } from 'discord.js';
export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => Promise<void>;
    guildOnly?: boolean;
}
//# sourceMappingURL=Command.d.ts.map
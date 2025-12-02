import type { ChatInputApplicationCommandData, CommandInteraction, Client, AutocompleteInteraction } from 'discord.js';

// Wir verwenden ein Interface, um die Struktur jedes Befehls zu definieren
export interface Command extends ChatInputApplicationCommandData {
    // Feste Definitionen für Discord Slash Commands
    
    // Die auszuführende Funktion, wenn der Befehl aufgerufen wird
    run: (
        client: Client,
        interaction: CommandInteraction
    ) => Promise<void>;
    
    // Optional: Funktion zur Behandlung von Autocomplete-Interaktionen
    autocomplete?: (
        client: Client,
        interaction: AutocompleteInteraction
    ) => Promise<void>;
    
    // Optional: Soll der Befehl nur in Gilden funktionieren?
    guildOnly?: boolean; 
}
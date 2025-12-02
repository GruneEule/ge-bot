const { Client, Collection, REST, Routes } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');

// Import types separately for type checking
import type { ClientOptions, ChatInputApplicationCommandData, CommandInteraction } from 'discord.js';
import type { Command } from '../types/Command';
import type { Event } from '../types/Event'; // NEU

// Pfad zum commands-Ordner
const commandFolder = join(__dirname, '../commands');

// NEU: Pfad zum Event-Ordner
const eventFolder = join(__dirname, '../events');

class CustomClient extends Client {
    // Eine Collection (Map) speichert alle geladenen Befehle
    public commands: typeof Collection.prototype;
    public configService: any; // Will be initialized with ConfigurationService
    
    constructor(options: ClientOptions, configService?: any) {
        console.log('[Client] Initializing CustomClient');
        super(options);
        this.commands = new Collection();
        this.configService = configService;
        console.log('[Client] CustomClient initialized');
    }

    /**
     * Lädt alle Befehle aus dem 'commands' Ordner und seinen Unterordnern.
     */
    public loadCommands() {
        console.log('[Client] Loading commands');
        // Durchsuche alle Unterordner (z.B. moderation, management)
        for (const dir of readdirSync(commandFolder)) {
            const dirPath = join(commandFolder, dir);
            
            // Lade alle .ts Dateien in diesem Unterordner
            const commandFiles = readdirSync(dirPath).filter((file: string) => file.endsWith('.ts'));

            for (const file of commandFiles) {
                // Use dynamic import to get both the command and its data
                const commandModule = require(join(dirPath, file));
                const command: Command = commandModule.default || commandModule;
                
                // Check if the module exports a 'data' property (SlashCommandBuilder)
                if (commandModule.data) {
                    // Use the data from SlashCommandBuilder
                    const commandData = commandModule.data.toJSON();
                    this.commands.set(commandData.name, {...command, ...commandData});
                    console.log(`[Commands] Befehl geladen: /${commandData.name}`);
                } else {
                    // Fallback to the command object itself
                    this.commands.set(command.name, command);
                    console.log(`[Commands] Befehl geladen: /${command.name}`);
                }
            }
        }
        console.log('[Client] Commands loaded');
    }

    /**
     * Lädt alle Events aus dem 'events' Ordner und seinen Unterordnern.
     */
    public loadEvents() {
        console.log('[Client] Loading events');
        // Durchsuche alle Unterordner (z.B. client, guild)
        for (const dir of readdirSync(eventFolder)) {
            const dirPath = join(eventFolder, dir);
            
            // Lade alle .ts Dateien in diesem Unterordner
            const eventFiles = readdirSync(dirPath).filter((file: string) => file.endsWith('.ts'));

            for (const file of eventFiles) {
                // Wir verwenden 'require' ohne '.default' weil die Events mit module.exports exportiert werden
                const event: Event<any> = require(join(dirPath, file)); 

                // Registriere den Event-Listener
                const execute = event.execute.bind(null, this as any); // Typumwandlung für Bind
                
                if (event.once) {
                    this.once(event.name, execute);
                } else {
                    this.on(event.name, execute);
                }

                console.log(`[Events] Event geladen: ${event.name}`);
            }
        }
        console.log('[Client] Events loaded');
    }
    
    /**
     * Registriert alle Befehle bei der Discord API.
     * @param token Der Bot-Token.
     * @param clientId Die Client ID des Bots.
     */
    public async registerCommands(token: string, clientId: string) {
        console.log('[Client] Registering commands');
        const rest = new REST({ version: '10' }).setToken(token);
        
        // Erstelle ein Array von JSON-Objekten für die API
        const commandsJSON = [];
        for (const [key, cmd] of this.commands) {
            // Wenn der Befehl data-Eigenschaft hat (von SlashCommandBuilder), verwenden wir diese
            if (cmd.data) {
                commandsJSON.push(cmd.data.toJSON());
            } else {
                // Fallback für ältere Befehle
                commandsJSON.push({
                    name: cmd.name,
                    description: cmd.description,
                    dm_permission: cmd.dmPermission !== undefined ? cmd.dmPermission : true
                });
            }
        }

        try {
            console.log(`[API] Starte die Registrierung von ${commandsJSON.length} Application Commands...`);

            // Registriere die Commands global bei Discord (kann bis zu 1 Stunde dauern)
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commandsJSON },
            );

            console.log('[API] Application Commands erfolgreich registriert!');
        } catch (error) {
            console.error('[API] Fehler beim Registrieren der Commands:', error);
        }
        console.log('[Client] Commands registered');
    }
}

// Export the class using module.exports for CommonJS
module.exports = { CustomClient };
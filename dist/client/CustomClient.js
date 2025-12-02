"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Client, Collection, REST, Routes } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');
// Pfad zum commands-Ordner
const commandFolder = join(__dirname, '../commands');
// NEU: Pfad zum Event-Ordner
const eventFolder = join(__dirname, '../events');
class CustomClient extends Client {
    constructor(options, configService) {
        super(options);
        this.commands = new Collection();
        this.configService = configService;
    }
    /**
     * Lädt alle Befehle aus dem 'commands' Ordner und seinen Unterordnern.
     */
    loadCommands() {
        // Durchsuche alle Unterordner (z.B. moderation, management)
        for (const dir of readdirSync(commandFolder)) {
            const dirPath = join(commandFolder, dir);
            // Lade alle .ts Dateien in diesem Unterordner
            const commandFiles = readdirSync(dirPath).filter((file) => file.endsWith('.ts'));
            for (const file of commandFiles) {
                const command = require(join(dirPath, file));
                // Speichere den Befehl in unserer Collection
                this.commands.set(command.name, command);
                console.log(`[Commands] Befehl geladen: /${command.name}`);
            }
        }
    }
    // NEUE METHODE
    loadEvents() {
        // Durchsuche alle Unterordner (z.B. client, guild)
        for (const dir of readdirSync(eventFolder)) {
            const dirPath = join(eventFolder, dir);
            // Lade alle .ts Dateien in diesem Unterordner
            const eventFiles = readdirSync(dirPath).filter((file) => file.endsWith('.ts'));
            for (const file of eventFiles) {
                // Wir verwenden 'require' und '.default' wegen der Kompilierung
                const event = require(join(dirPath, file)).default;
                // Registriere den Event-Listener
                const execute = event.execute.bind(null, this); // Typumwandlung für Bind
                if (event.once) {
                    this.once(event.name, execute);
                }
                else {
                    this.on(event.name, execute);
                }
                console.log(`[Events] Event geladen: ${event.name}`);
            }
        }
    }
    /**
     * Registriert alle Befehle bei der Discord API.
     * @param token Der Bot-Token.
     * @param clientId Die Client ID des Bots.
     */
    async registerCommands(token, clientId) {
        const rest = new REST({ version: '10' }).setToken(token);
        // Erstelle ein Array von JSON-Objekten für die API
        const commandsJSON = [];
        for (const [key, cmd] of this.commands) {
            // Create proper command structure for Discord API
            commandsJSON.push({
                name: cmd.name,
                description: cmd.description,
                dm_permission: cmd.dmPermission !== undefined ? cmd.dmPermission : true
            });
        }
        try {
            console.log(`[API] Starte die Registrierung von ${commandsJSON.length} Application Commands...`);
            // Registriere die Commands global bei Discord (kann bis zu 1 Stunde dauern)
            await rest.put(Routes.applicationCommands(clientId), { body: commandsJSON });
            console.log('[API] Application Commands erfolgreich registriert!');
        }
        catch (error) {
            console.error('[API] Fehler beim Registrieren der Commands:', error);
        }
    }
}
// Export the class using module.exports for CommonJS
module.exports = { CustomClient };
//# sourceMappingURL=CustomClient.js.map
import type { Event } from '../../types/Event';
import type { Client } from 'discord.js';

// Das 'ready'-Event wird nur einmal ausgeführt ('once: true')
const readyEvent: Event<'ready'> = {
    name: 'ready',
    once: true,
    
    // Wir übergeben nur den Client, da das 'ready'-Event keine weiteren Parameter hat
    execute: async (client: Client) => {
        if (client.user) {
            console.log(`✅ Event-System: Bot ist bereit! Eingeloggt als ${client.user.tag}.`);

            // Initialize the configuration service
            if ((client as any).configService) {
                await (client as any).configService.initialize();
            }

            // WICHTIG: Hier rufen wir die Command-Registrierung auf
            const token = process.env.DISCORD_BOT_TOKEN;
            const clientId = process.env.DISCORD_CLIENT_ID;

            if (token && clientId) {
                // Wir müssen aufpassen, da 'client' hier ein Standard-Client ist, 
                // aber im index.ts als CustomClient instanziiert wird.
                // Um Typ-Fehler zu vermeiden, casten wir oder nutzen die CustomClient-Instanz aus index.ts
                // Für dieses Setup belassen wir die Logik im index.ts, bis wir den client-Typ sicher gecastet haben.
                // Wir nutzen dieses Event vorerst nur für die Konsolenausgabe.
            }
        }
    }
};

module.exports = readyEvent;
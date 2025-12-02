"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const guildMemberAddEvent = {
    name: 'guildMemberAdd',
    once: false, // Dieses Event soll bei jedem neuen Mitglied ausgeführt werden
    execute: async (client, member) => {
        // Sicherstellen, dass der übergebene Client unser CustomClient ist
        const customClient = client;
        console.log(`[Autrole] Neues Mitglied auf ${member.guild.name}: ${member.user.tag}`);
        // 1. Konfiguration abrufen
        const config = await customClient.configService.getOrCreateConfig(member.guild.id);
        // 2. Prüfen, ob eine Autorole konfiguriert ist
        const autoRoleId = config.autoRoleId;
        if (autoRoleId) {
            try {
                // 3. Rolle zuweisen
                await member.roles.add(autoRoleId, 'Automatisches Zuweisen beim Beitritt (Autrole)');
                console.log(`[Autrole] Rolle ${autoRoleId} erfolgreich an ${member.user.tag} zugewiesen.`);
            }
            catch (error) {
                console.error(`❌ [Autrole] Fehler beim Zuweisen der Rolle ${autoRoleId} an ${member.user.tag}:`, error);
                // Hier könnte man später eine Log-Nachricht in den Log-Channel senden
            }
        }
    }
};
module.exports = guildMemberAddEvent;
//# sourceMappingURL=guildMemberAdd.js.map
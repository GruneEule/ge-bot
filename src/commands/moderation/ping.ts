import type { Command } from '../../types/Command';
const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Prüft die Latenz des Bots und der API.')
    .setDMPermission(false);

const pingCommand: Command = {
    // Definiert die Metadaten des Slash Commands
    name: 'ping',
    description: 'Prüft die Latenz des Bots und der API.',
    dmPermission: false,

    // Die Funktion, die ausgeführt wird
    run: async (client, interaction) => {
        // Berechne die Bot-Latenz (wie lange die Nachricht brauchte, um anzukommen)
        const botLatency = Date.now() - interaction.createdTimestamp;
        
        // Die API-Latenz ist im Client verfügbar
        const apiLatency = client.ws.ping;

        await interaction.reply({
            content: `🏓 **Pong!**\n` +
                     `Bot Latenz: **${Math.abs(botLatency)}ms**\n` +
                     `API Latenz: **${Math.round(apiLatency)}ms**`,
            ephemeral: true // Nur für den Benutzer sichtbar
        });
    },
};

module.exports = pingCommand;
module.exports.data = data;
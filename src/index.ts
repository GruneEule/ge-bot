const { GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const { CustomClient } = require('./client/CustomClient');
const { ConfigurationService } = require('./services/ConfigurationService');

// Import types for type checking only
import type { Client, Interaction } from 'discord.js';
import type { CommandInteraction } from 'discord.js';
import type { AutocompleteInteraction } from 'discord.js';

console.log('[Main] Loading environment variables');
// 1. Lade Umgebungsvariablen
dotenv.config();

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID; // Wird für die Command-Registrierung benötigt!

console.log('[Main] Environment variables loaded');
console.log('[Main] DISCORD_BOT_TOKEN:', !!token);
console.log('[Main] DISCORD_CLIENT_ID:', !!clientId);
console.log('[Main] DATABASE_URL:', !!process.env.DATABASE_URL);

// Ensure DATABASE_URL is properly encoded
if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/\\/g, '\\\\');
}

// Wrap everything in an async function to handle top-level awaits
(async () => {
  console.log('[Main] Initializing services');
  // 2. Initialisiere Services
  const configService = new ConfigurationService(); // Enabled ConfigurationService
  await configService.initialize(); // Initialize the configuration service
  console.log('[Main] Services initialized');

  // 3. Erstelle eine neue Custom Client Instanz
  const client = new CustomClient({
      intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.MessageContent, 
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildVoiceStates,
      ],
  }, configService);

  // NEU: Events laden
  client.loadCommands(); // Commands zuerst laden
  client.loadEvents();   // Events laden

  // WICHTIG: Registriere Commands HIER, da die Logik den clientId aus index.ts braucht 
  // und der Event-Handler noch keine Typ-Sicherheit für CustomClient hat.
  client.once('ready', async () => {
      console.log('[Main] Client ready event triggered');
      if (client.user) {
          // Die 'ready'-Logik wird jetzt durch den Event-Handler (ready.ts) behandelt,
          // aber wir brauchen die Command-Registrierung direkt nach dem Start.
          
          // Registriere Commands bei Discord API
          if (token && clientId) {
              await client.registerCommands(token, clientId);
          } else {
              console.error("❌ DISCORD_BOT_TOKEN oder DISCORD_CLIENT_ID fehlen in der .env-Datei.");
          }
      }
      console.log('[Main] Client ready event completed');
  });

  // 5. Verarbeite Command Interactions
  client.on('interactionCreate', async (interaction: Interaction) => {
      console.log('[Main] Interaction received');
      
      // Handle autocomplete interactions
      if (interaction.isAutocomplete()) {
          const command = client.commands.get(interaction.commandName);
          
          if (!command || !command.autocomplete) return;
          
          try {
              await command.autocomplete(client, interaction);
          } catch (error) {
              console.error(`❌ Fehler beim Verarbeiten der Autocomplete-Anfrage für /${command.name}:`, error);
          }
          return;
      }
      
      // Nur Slash Commands verarbeiten
      if (!interaction.isChatInputCommand()) return;
      
      // Finde den Befehl in der Collection
      const command = client.commands.get(interaction.commandName);
      
      if (!command) return;

      // Führe den Befehl aus
      try {
          await command.run(client, interaction);
      } catch (error) {
          console.error(`❌ Fehler beim Ausführen des Befehls /${command.name}:`, error);
          if (interaction.replied || interaction.deferred) {
              await interaction.followUp({ content: 'Beim Ausführen des Befehls ist ein Fehler aufgetreten!', ephemeral: true });
          } else {
              await interaction.reply({ content: 'Beim Ausführen des Befehls ist ein Fehler aufgetreten!', ephemeral: true });
          }
      }
      console.log('[Main] Interaction processed');
  });

  // 6. Starte den Bot
  if (!token || !clientId) {
      console.error("❌ Bitte Token UND Client ID in der .env-Datei angeben.");
      process.exit(1);
  }

  console.log('[Main] Starting bot login');
  client.login(token);
  console.log('[Main] Bot login initiated');
})();
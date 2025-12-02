import type { Command } from '../../types/Command';
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

// Create the command data structure
const data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Konfiguriert wichtige Funktionen des Bots für diesen Server.')
    .setDMPermission(false) // Nur auf Servern
    // Der Befehl darf nur von Administratoren ausgeführt werden
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addSubcommandGroup((group: any) =>
        group
            .setName('autrole')
            .setDescription('Verwaltet die automatische Rollenzuweisung beim Beitritt.')
            .addSubcommand((subcommand: any) => 
                subcommand
                    .setName('set')
                    .setDescription('Legt die Rolle fest, die neue Mitglieder automatisch erhalten.')
                    .addStringOption((option: any) => 
                        option
                            .setName('rolle')
                            .setDescription('Die Rolle, die neuen Mitgliedern zugewiesen werden soll.')
                            .setRequired(true)
                            .setAutocomplete(true) // Enable autocomplete for this option
                    )
            )
            .addSubcommand((subcommand: any) => 
                subcommand
                    .setName('disable')
                    .setDescription('Deaktiviert die Autrole-Funktion.')
            )
    );

const setupCommand: Command = {
    // Definiert die Metadaten des Slash Commands
    name: 'setup',
    description: 'Konfiguriert wichtige Funktionen des Bots für diesen Server.',
    dmPermission: false,
    defaultMemberPermissions: PermissionsBitField.Flags.Administrator,
        
    // Die Funktion, die ausgeführt wird
    run: async (client: any, interaction: any) => {
        // Muss auf einem Server ausgeführt werden
        if (!interaction.guild) {
            await interaction.reply({ content: 'Dieser Befehl kann nur auf einem Server ausgeführt werden.', ephemeral: true });
            return;
        }

        const subcommandGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        await interaction.deferReply({ ephemeral: true }); // Warte auf die Antwort

        // --- AUTOROLE LOGIK ---
        if (subcommandGroup === 'autrole') {
            
            if (subcommand === 'set') {
                // Get the role ID from the autocomplete option
                const roleId = interaction.options.getString('rolle');
                
                // Try to fetch the role by ID
                const fetchedRole = await interaction.guild.roles.fetch(roleId).catch(() => null);
                
                if (!fetchedRole) {
                     await interaction.editReply('❌ Fehler: Konnte die Rolle nicht finden.');
                     return;
                }

                try {
                    // Aktualisiere die Konfiguration in der Datenbank
                    await client.configService.setGuildConfig(interaction.guildId, {
                        autoRoleId: fetchedRole.id,
                    });

                    await interaction.editReply({
                        content: `✅ **Autrole** erfolgreich eingerichtet!\n` + 
                                 `Neue Mitglieder erhalten nun automatisch die Rolle: **${fetchedRole.name}**.`
                    });
                } catch (error) {
                    console.error('Fehler beim Speichern der Autrole-Konfiguration:', error);
                    await interaction.editReply('❌ Ein Fehler ist aufgetreten beim Speichern in der Datenbank.');
                }
            } 
            
            else if (subcommand === 'disable') {
                try {
                    // Setze autoRoleId auf NULL (oder undefined, was Prisma als NULL interpretiert)
                    await client.configService.setGuildConfig(interaction.guildId, {
                        autoRoleId: null,
                    });

                    await interaction.editReply('✅ **Autrole** erfolgreich deaktiviert.');
                } catch (error) {
                    console.error('Fehler beim Deaktivieren der Autrole:', error);
                    await interaction.editReply('❌ Ein Fehler ist aufgetreten beim Deaktivieren in der Datenbank.');
                }
            }
        }
        
        // --- Hier würden später weitere Setup-Gruppen folgen (z.B. logging) ---
    },
    
    // Autocomplete handler for role suggestions
    autocomplete: async (client: any, interaction: any) => {
        const focusedOption = interaction.options.getFocused(true);
        
        if (focusedOption.name === 'rolle') {
            if (!interaction.guild) {
                await interaction.respond([]);
                return;
            }
            
            try {
                // Fetch all roles from the guild
                const roles = await interaction.guild.roles.fetch();
                
                // Filter roles based on user input
                const filteredRoles = roles.filter((role: any) => 
                    role.name.toLowerCase().includes(focusedOption.value.toLowerCase()) &&
                    role.name !== '@everyone' // Exclude @everyone role
                );
                
                // Map to choice format (max 25 choices)
                const choices = filteredRoles
                    .first(25)
                    .map((role: any) => ({
                        name: role.name.length > 100 ? role.name.substring(0, 97) + '...' : role.name,
                        value: role.id
                    }));
                
                await interaction.respond(choices);
            } catch (error) {
                console.error('Fehler beim Abrufen der Rollen für Autocomplete:', error);
                await interaction.respond([]);
            }
        }
    }
};

module.exports = setupCommand;
module.exports.data = data;
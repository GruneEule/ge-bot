const { PrismaClient } = require('@prisma/client');

// Import types for type checking only
import type { GuildConfig } from '@prisma/client';

class ConfigurationService {
  private prisma: any;

  constructor() {
    console.log('[Config] Initializing Prisma Client');
    this.prisma = new PrismaClient();
    console.log('[Config] Prisma Client initialized');
  }

  async initialize(): Promise<void> {
    // Initialize any configuration data here
    console.log('[Config] Configuration service initialized');
    
    // Test database connection
    try {
      await this.prisma.$connect();
      console.log('[Config] Database connection successful');
    } catch (error) {
      console.error('[Config] Database connection failed:', error);
    }
  }

  async getGuildConfig(guildId: string): Promise<GuildConfig | null> {
    return await this.prisma.guildConfig.findUnique({
      where: { id: guildId }
    });
  }

  async setGuildConfig(guildId: string, config: Partial<GuildConfig>): Promise<GuildConfig> {
    return await this.prisma.guildConfig.upsert({
      where: { id: guildId },
      update: config,
      create: { id: guildId, ...config }
    });
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }

  /**
   * Gets or creates a guild configuration
   * @param guildId The ID of the guild
   * @returns The guild configuration
   */
  async getOrCreateConfig(guildId: string): Promise<GuildConfig> {
    let config = await this.prisma.guildConfig.findUnique({
      where: { id: guildId }
    });

    if (!config) {
      config = await this.prisma.guildConfig.create({
        data: { id: guildId }
      });
    }

    return config;
  }
}

// Export the class using module.exports for CommonJS
module.exports = { ConfigurationService };
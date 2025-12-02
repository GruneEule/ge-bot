"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PrismaClient } = require('@prisma/client');
class ConfigurationService {
    constructor() {
        this.prisma = new PrismaClient();
    }
    async initialize() {
        // Initialize any configuration data here
        console.log('[Config] Configuration service initialized');
    }
    async getGuildConfig(guildId) {
        return await this.prisma.guildConfig.findUnique({
            where: { id: guildId }
        });
    }
    async setGuildConfig(guildId, config) {
        return await this.prisma.guildConfig.upsert({
            where: { id: guildId },
            update: config,
            create: { id: guildId, ...config }
        });
    }
    async close() {
        await this.prisma.$disconnect();
    }
}
// Export the class using module.exports for CommonJS
module.exports = { ConfigurationService };
//# sourceMappingURL=ConfigurationService.js.map
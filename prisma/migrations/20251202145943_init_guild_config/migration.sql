-- CreateTable
CREATE TABLE `GuildConfig` (
    `id` VARCHAR(30) NOT NULL,
    `logChannelId` VARCHAR(30) NULL,
    `autoRoleId` VARCHAR(30) NULL,
    `warnLimit` INTEGER NOT NULL DEFAULT 3,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

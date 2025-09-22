-- AlterTable
ALTER TABLE `accesscode` ADD COLUMN `used` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `courselevel` ADD COLUMN `downloadUrl` VARCHAR(191) NULL;

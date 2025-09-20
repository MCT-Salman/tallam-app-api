-- DropForeignKey
ALTER TABLE `subject` DROP FOREIGN KEY `Subject_specializationId_fkey`;

-- AlterTable
ALTER TABLE `subject` MODIFY `specializationId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_specializationId_fkey` FOREIGN KEY (`specializationId`) REFERENCES `Specialization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

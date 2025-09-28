/*
  Warnings:

  - You are about to drop the column `mimeType` on the `file` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `file` DROP COLUMN `mimeType`,
    ADD COLUMN `courseLevelId` INTEGER NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `type` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `File_courseLevelId_idx` ON `File`(`courseLevelId`);

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_courseLevelId_fkey` FOREIGN KEY (`courseLevelId`) REFERENCES `CourseLevel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

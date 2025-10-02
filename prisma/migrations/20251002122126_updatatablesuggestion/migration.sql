-- AlterTable
ALTER TABLE `suggestion` ADD COLUMN `courseLevelId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Suggestion_courseLevelId_idx` ON `Suggestion`(`courseLevelId`);

-- AddForeignKey
ALTER TABLE `Suggestion` ADD CONSTRAINT `Suggestion_courseLevelId_fkey` FOREIGN KEY (`courseLevelId`) REFERENCES `CourseLevel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `Suggestion_userId_idx` ON `Suggestion`(`userId`);

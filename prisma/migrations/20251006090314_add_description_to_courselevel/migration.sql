/*
  Warnings:

  - Made the column `courseLevelId` on table `question` required. This step will fail if there are existing NULL values in that column.
  - Made the column `courseLevelId` on table `quizresult` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `question` DROP FOREIGN KEY `Question_courseLevelId_fkey`;

-- DropForeignKey
ALTER TABLE `quizresult` DROP FOREIGN KEY `QuizResult_courseLevelId_fkey`;

-- DropIndex
DROP INDEX `Question_courseLevelId_fkey` ON `question`;

-- AlterTable
ALTER TABLE `courselevel` ADD COLUMN `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `question` MODIFY `courseLevelId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `quizresult` MODIFY `courseLevelId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_courseLevelId_fkey` FOREIGN KEY (`courseLevelId`) REFERENCES `CourseLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizResult` ADD CONSTRAINT `QuizResult_courseLevelId_fkey` FOREIGN KEY (`courseLevelId`) REFERENCES `CourseLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `QuizResult_courseLevelId_idx` ON `QuizResult`(`courseLevelId`);
DROP INDEX `QuizResult_courseLevelId_fkey` ON `quizresult`;

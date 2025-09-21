/*
  Warnings:

  - You are about to drop the column `courseId` on the `accesscode` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `isFree` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `lesson` table. All the data in the column will be lost.
  - Added the required column `courseLevelId` to the `AccessCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instructorId` to the `CourseLevel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Made the column `courseLevelId` on table `lesson` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `accesscode` DROP FOREIGN KEY `AccessCode_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `lesson` DROP FOREIGN KEY `Lesson_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `lesson` DROP FOREIGN KEY `Lesson_courseLevelId_fkey`;

-- DropIndex
DROP INDEX `AccessCode_courseId_idx` ON `accesscode`;

-- DropIndex
DROP INDEX `Lesson_courseId_idx` ON `lesson`;

-- AlterTable
ALTER TABLE `accesscode` DROP COLUMN `courseId`,
    ADD COLUMN `courseLevelId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `course` DROP COLUMN `currency`,
    DROP COLUMN `isFree`,
    DROP COLUMN `price`;

-- AlterTable
ALTER TABLE `courselevel` ADD COLUMN `instructorId` INTEGER NOT NULL,
    ADD COLUMN `isFree` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `priceSAR` DOUBLE NULL,
    ADD COLUMN `priceUSD` DOUBLE NULL;

-- AlterTable
ALTER TABLE `instructor` ADD COLUMN `subjectId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `lesson` DROP COLUMN `courseId`,
    MODIFY `courseLevelId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `AccessCode_courseLevelId_idx` ON `AccessCode`(`courseLevelId`);

-- CreateIndex
CREATE INDEX `CourseLevel_instructorId_idx` ON `CourseLevel`(`instructorId`);

-- AddForeignKey
ALTER TABLE `Instructor` ADD CONSTRAINT `Instructor_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseLevel` ADD CONSTRAINT `CourseLevel_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `Instructor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_courseLevelId_fkey` FOREIGN KEY (`courseLevelId`) REFERENCES `CourseLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessCode` ADD CONSTRAINT `AccessCode_courseLevelId_fkey` FOREIGN KEY (`courseLevelId`) REFERENCES `CourseLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - Added the required column `courseLevelId` to the `Coupon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `coupon` ADD COLUMN `courseLevelId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `course` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `specialization` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Coupon_courseLevelId_idx` ON `Coupon`(`courseLevelId`);

-- AddForeignKey
ALTER TABLE `Coupon` ADD CONSTRAINT `Coupon_courseLevelId_fkey` FOREIGN KEY (`courseLevelId`) REFERENCES `CourseLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

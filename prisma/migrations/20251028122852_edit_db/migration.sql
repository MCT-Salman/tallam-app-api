/*
  Warnings:

  - You are about to alter the column `status` on the `accesscode` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `accesscode` MODIFY `status` ENUM('NOT_USED', 'USED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'NOT_USED';

-- AlterTable
ALTER TABLE `coupon` ADD COLUMN `reason` VARCHAR(191) NULL,
    ADD COLUMN `userId` INTEGER NULL,
    MODIFY `courseLevelId` INTEGER NULL;

-- AlterTable
ALTER TABLE `story` ADD COLUMN `isStory` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX `coupon_userId_idx` ON `coupon`(`userId`);

-- AddForeignKey
ALTER TABLE `coupon` ADD CONSTRAINT `coupon_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

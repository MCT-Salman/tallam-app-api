/*
  Warnings:

  - Made the column `usedBy` on table `accesscode` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `accesscode` DROP FOREIGN KEY `AccessCode_usedBy_fkey`;

-- AlterTable
ALTER TABLE `accesscode` MODIFY `usedBy` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `FinancialAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `receiptImageUrl` VARCHAR(191) NOT NULL,
    `amountPaid` DECIMAL(12, 2) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `accessCodeId` INTEGER NOT NULL,
    `couponId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FinancialAccount_accessCodeId_idx`(`accessCodeId`),
    INDEX `FinancialAccount_couponId_idx`(`couponId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccessCode` ADD CONSTRAINT `AccessCode_usedBy_fkey` FOREIGN KEY (`usedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinancialAccount` ADD CONSTRAINT `FinancialAccount_accessCodeId_fkey` FOREIGN KEY (`accessCodeId`) REFERENCES `AccessCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinancialAccount` ADD CONSTRAINT `FinancialAccount_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

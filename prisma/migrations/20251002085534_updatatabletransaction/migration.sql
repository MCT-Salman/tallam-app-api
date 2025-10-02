/*
  Warnings:

  - You are about to drop the column `amount` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `courseLevelId` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the `financialaccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `videolinkcheck` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `accessCodeId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountPaid` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiptImageUrl` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `financialaccount` DROP FOREIGN KEY `FinancialAccount_accessCodeId_fkey`;

-- DropForeignKey
ALTER TABLE `financialaccount` DROP FOREIGN KEY `FinancialAccount_couponId_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_courseLevelId_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_userId_fkey`;

-- DropForeignKey
ALTER TABLE `videolinkcheck` DROP FOREIGN KEY `VideoLinkCheck_lessonId_fkey`;

-- DropIndex
DROP INDEX `Transaction_courseLevelId_idx` ON `transaction`;

-- DropIndex
DROP INDEX `Transaction_status_idx` ON `transaction`;

-- DropIndex
DROP INDEX `Transaction_userId_idx` ON `transaction`;

-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `amount`,
    DROP COLUMN `courseLevelId`,
    DROP COLUMN `currency`,
    DROP COLUMN `metadata`,
    DROP COLUMN `providerId`,
    DROP COLUMN `status`,
    DROP COLUMN `userId`,
    ADD COLUMN `accessCodeId` INTEGER NOT NULL,
    ADD COLUMN `amountPaid` DECIMAL(12, 2) NOT NULL,
    ADD COLUMN `couponId` INTEGER NULL,
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `receiptImageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `financialaccount`;

-- DropTable
DROP TABLE `videolinkcheck`;

-- CreateIndex
CREATE INDEX `Transaction_accessCodeId_idx` ON `Transaction`(`accessCodeId`);

-- CreateIndex
CREATE INDEX `Transaction_couponId_idx` ON `Transaction`(`couponId`);

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_accessCodeId_fkey` FOREIGN KEY (`accessCodeId`) REFERENCES `AccessCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

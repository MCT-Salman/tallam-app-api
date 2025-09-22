-- DropForeignKey
ALTER TABLE `financialaccount` DROP FOREIGN KEY `FinancialAccount_couponId_fkey`;

-- AlterTable
ALTER TABLE `financialaccount` MODIFY `couponId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `FinancialAccount` ADD CONSTRAINT `FinancialAccount_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

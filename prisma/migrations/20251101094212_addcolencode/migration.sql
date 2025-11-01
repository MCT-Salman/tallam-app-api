/*
  Warnings:

  - A unique constraint covering the columns `[encode]` on the table `courseLevel` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `courselevel` ADD COLUMN `encode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `courseLevel_encode_key` ON `courseLevel`(`encode`);

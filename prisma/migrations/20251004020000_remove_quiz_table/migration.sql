-- Add courseLevelId columns to Question and QuizResult tables
ALTER TABLE `Question` ADD COLUMN `courseLevelId` INTEGER NULL;
ALTER TABLE `QuizResult` ADD COLUMN `courseLevelId` INTEGER NULL;

-- Update existing data to set courseLevelId based on quiz relationships
UPDATE `Question` q
SET `courseLevelId` = (SELECT `courseLevelId` FROM `Quiz` WHERE `id` = q.`quizId`);

UPDATE `QuizResult` qr
SET `courseLevelId` = (SELECT `courseLevelId` FROM `Quiz` WHERE `id` = qr.`quizId`);

-- Add foreign key constraints
ALTER TABLE `Question` ADD CONSTRAINT `Question_courseLevelId_fkey` FOREIGN KEY (`courseLevelId`) REFERENCES `CourseLevel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `QuizResult` ADD CONSTRAINT `QuizResult_courseLevelId_fkey` FOREIGN KEY (`courseLevelId`) REFERENCES `CourseLevel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove old foreign keys
ALTER TABLE `Question` DROP FOREIGN KEY `Question_quizId_fkey`;
ALTER TABLE `QuizResult` DROP FOREIGN KEY `QuizResult_quizId_fkey`;

-- Drop old columns
ALTER TABLE `Question` DROP COLUMN `quizId`;
ALTER TABLE `QuizResult` DROP COLUMN `quizId`;

-- Drop the Quiz table
DROP TABLE `Quiz`;

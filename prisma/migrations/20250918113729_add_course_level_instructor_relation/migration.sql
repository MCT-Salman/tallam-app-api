-- CreateTable
CREATE TABLE `CourseLevelInstructor` (
    `courseLevelId` INTEGER NOT NULL,
    `instructorId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CourseLevelInstructor_courseLevelId_idx`(`courseLevelId`),
    INDEX `CourseLevelInstructor_instructorId_idx`(`instructorId`),
    PRIMARY KEY (`courseLevelId`, `instructorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CourseLevelInstructor` ADD CONSTRAINT `CourseLevelInstructor_courseLevelId_fkey` FOREIGN KEY (`courseLevelId`) REFERENCES `CourseLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseLevelInstructor` ADD CONSTRAINT `CourseLevelInstructor_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `Instructor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

import prisma from '../prisma/client.js';
import { CourseProgressModel, LessonProgressModel } from '../models/index.js';

/**
 * Checks if a user has access to a specific course.
 * @param {number} userId
 * @param {number} courseId
 * @returns {Promise<boolean>}
 */
const checkCourseAccess = async (userId, courseId) => {
  const access = await prisma.accessCode.findFirst({
    where: {
      courseLevel: { courseId },
      usedBy: userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
  return !!access;
};

/**
 * Marks a lesson as completed for a user and updates the overall course progress.
 * @param {number} userId
 * @param {number} lessonId
 * @returns {Promise<object>}
 */
export const markLessonAsComplete = async (userId, lessonId) => {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { courseLevel: true } });
  if (!lesson) {
    throw new Error('الدرس غير موجود');
  }

  const hasAccess = await checkCourseAccess(userId, lesson.courseLevel.courseId);
  if (!hasAccess) {
    throw new Error('ليس لديك صلاحية الوصول لهذه الدورة');
  }

  // Mark lesson as complete
  const lessonProgress = await LessonProgressModel.create({
    userId,
    lessonId,
    completed: true,
  });

  // Recalculate course progress
  const courseId = lesson.courseLevel.courseId;
  const { _count: { id: totalLessons } } = await prisma.lesson.aggregate({
    where: { courseLevel: { courseId } },
    _count: { id: true },
  });

  const { _count: { id: completedLessons } } = await prisma.lessonProgress.aggregate({
    where: { userId, lesson: { courseLevel: { courseId } } },
    _count: { id: true },
  });

  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Upsert course progress
  const courseProgress = await CourseProgressModel.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, progress: progressPercentage, completed: progressPercentage >= 100 },
    update: { progress: progressPercentage, completed: progressPercentage >= 100 },
  });

  return { lessonProgress, courseProgress };
};

/**
 * Gets the progress for a specific user and course.
 * @param {number} userId
 * @param {number} courseId
 * @returns {Promise<object|null>}
 */
export const getCourseProgressForUser = async (userId, courseId) => {
  const hasAccess = await checkCourseAccess(userId, courseId);
  if (!hasAccess) {
    throw new Error('ليس لديك صلاحية الوصول لهذه الدورة');
  }

  const courseProgress = await CourseProgressModel.findFirst({
    where: { userId, courseId },
  });

  const completedLessons = await LessonProgressModel.findFirst({
    where: { userId, lesson: { courseLevel: { courseId } } },
  });

  return { courseProgress, completedLessons: completedLessons || [] };
};

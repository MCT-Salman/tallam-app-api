import prisma from "../prisma/client.js";

// Reusable select for nested course details
export const courseSelect = {
  id: true,
  title: true, // غيرتها من name إلى title لأن الموديل Course عندك فيه title
  imageUrl: true,
  specialization: {
    select: {
      id: true,
      name: true,
      imageUrl: true
    }
  }
};

// Levels
export const createLevel = (courseId, data) =>
  prisma.courseLevel.create({
    data: { ...data, courseId },
    include: {
      course: { select: courseSelect },
      instructor: true
    }
  });

export const listLevelsByCourse = (courseId) =>
  prisma.courseLevel.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    include: {
      course: { select: courseSelect },
      instructor: true
    }
  });

export const updateLevel = (id, data) =>
  prisma.courseLevel.update({
    where: { id },
    data,
    include: {
      course: { select: courseSelect },
      instructor: true
    }
  });

export const toggleLevel = (id, isActive) =>
  prisma.courseLevel.update({
    where: { id },
    data: { isActive },
    include: { course: { select: courseSelect } }
  });

export const deleteLevel = (id) =>
  prisma.courseLevel.delete({ where: { id } });

// Lessons
export const createLessonForLevel = async (courseLevelId, data) => {
  const level = await prisma.courseLevel.findUnique({
    where: { id: courseLevelId },
    select: { courseId: true }
  });
  if (!level) throw new Error("المستوى غير موجود");

  return prisma.lesson.create({
    data: { ...data, courseLevelId },
    include: {
      courseLevel: { include: { course: { select: courseSelect } } }
    }
  });
};

export const listLessonsByLevel = (courseLevelId) =>
  prisma.lesson.findMany({
    where: { courseLevelId },
    orderBy: [{ orderIndex: "asc" }, { id: "asc" }],
    include: {
      courseLevel: { include: { course: { select: courseSelect } } }
    }
  });

export const updateLesson = (id, data) =>
  prisma.lesson.update({
    where: { id },
    data,
    include: {
      courseLevel: { include: { course: { select: courseSelect } } }
    }
  });

export const toggleLesson = (id, isActive) =>
  prisma.lesson.update({
    where: { id },
    data: { isActive },
    include: {
      courseLevel: { include: { course: { select: courseSelect } } }
    }
  });

export const deleteLesson = (id) =>
  prisma.lesson.delete({ where: { id } });

/**
 * Public: list levels for a course filtered by instructor assigned to the level
 */
export const listLevelsByCourseAndInstructor = async (courseId, instructorId) => {
  return prisma.courseLevel.findMany({
    where: {
      courseId,
      instructorId,
      isActive: true
    },
    orderBy: { order: "asc" },
    select: {
      id: true,
      order: true
    }
  });
};

export const DetailLevel = async (courseLevelId, userId = null) => {
  const baseInclude = {
    course: { select: courseSelect },
    instructor: {
      select: {
        id: true,
        name: true,
        avatarUrl: true
      }
    }
  };

  // Base query: always include level details and lesson names (without full details)
  const result = await prisma.courseLevel.findUnique({
    where: { id: courseLevelId },
    include: {
      ...baseInclude,
      lessons: {
        select: {
          id: true,
          title: true,
          description: true,
          durationSec: true,
          orderIndex: true
        }
      }
    }
  });

  if (!result) {
    throw new Error("المستوى غير موجود");
  }
  // If user is not logged in, return basic details
  if (!userId) {
    return result;
  }

  // Check if user has valid access code
  const accessCode = await prisma.accessCode.findFirst({
    where: {
      usedBy: userId,
      courseLevelId: courseLevelId,
      used: true
    }
  });

  // If access code exists with used=true, include full lesson details
  if (accessCode) {
    const fullResult = await prisma.courseLevel.findUnique({
      where: { id: courseLevelId },
      include: {
        ...baseInclude,
        lessons: true // Include full lesson details
      }
    });
    return fullResult;
  }

  // Otherwise, return basic details
  return result;
};

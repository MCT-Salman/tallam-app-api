import prisma from "../prisma/client.js";

// Levels
export const createLevel = (courseId, data) => prisma.courseLevel.create({
  data: { ...data, courseId },
  include: {
    course: { include: { subject: { include: { domain: true } }, instructor: true } }
  }
});
export const listLevelsByCourse = (courseId) => prisma.courseLevel.findMany({
  where: { courseId },
  orderBy: { orderIndex: 'asc' },
  include: {
    course: { include: { subject: { include: { domain: true } }, instructor: true } }
  }
});
export const updateLevel = (id, data) => prisma.courseLevel.update({
  where: { id },
  data,
  include: {
    course: { include: { subject: { include: { domain: true } }, instructor: true } }
  }
});
export const toggleLevel = (id, isActive) => prisma.courseLevel.update({
  where: { id },
  data: { isActive },
  include: {
    course: { include: { subject: { include: { domain: true } }, instructor: true } }
  }
});

// Lessons
export const createLessonForCourse = (courseId, data) => prisma.lesson.create({
  data: { ...data, courseId, levelId: null },
  include: {
    course: { include: { subject: { include: { domain: true } }, instructor: true } },
    level: { include: { course: { include: { subject: { include: { domain: true } }, instructor: true } } } }
  }
});
export const createLessonForLevel = (levelId, data) => prisma.lesson.create({
  data: { ...data, levelId },
  include: {
    course: { include: { subject: { include: { domain: true } }, instructor: true } },
    level: { include: { course: { include: { subject: { include: { domain: true } }, instructor: true } } } }
  }
});
export const listLessonsByCourse = (courseId) => prisma.lesson.findMany({
  where: { courseId },
  orderBy: [{ levelId: 'asc' }, { orderIndex: 'asc' }, { id: 'asc' }],
  include: {
    course: { include: { subject: { include: { domain: true } }, instructor: true } },
    level: { include: { course: { include: { subject: { include: { domain: true } }, instructor: true } } } }
  }
});
export const listLessonsByLevel = (levelId) => prisma.lesson.findMany({
  where: { levelId },
  orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }],
  include: {
    course: { include: { subject: { include: { domain: true } }, instructor: true } },
    level: { include: { course: { include: { subject: { include: { domain: true } }, instructor: true } } } }
  }
});
export const updateLesson = (id, data) => prisma.lesson.update({
  where: { id },
  data,
  include: {
    course: { include: { subject: { include: { domain: true } }, instructor: true } },
    level: { include: { course: { include: { subject: { include: { domain: true } }, instructor: true } } } }
  }
});
export const toggleLesson = (id, isActive) => prisma.lesson.update({
  where: { id },
  data: { isActive },
  include: {
    course: { include: { subject: { include: { domain: true } }, instructor: true } },
    level: { include: { course: { include: { subject: { include: { domain: true } }, instructor: true } } } }
  }
});

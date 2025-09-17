import prisma from "../prisma/client.js";

// Reusable include for nested course details
const courseInclude = {
  subject: { include: { specialization: { include: { domain: true } } } },
  instructors: { include: { instructor: true } }
};

// Levels
export const createLevel = (courseId, data) => prisma.courseLevel.create({
  data: { ...data, courseId },
  include: { course: { include: courseInclude } }
});
export const listLevelsByCourse = (courseId) => prisma.courseLevel.findMany({
  where: { courseId },
  orderBy: { order: 'asc' },
  include: { course: { include: courseInclude } }
});
export const updateLevel = (id, data) => prisma.courseLevel.update({
  where: { id },
  data,
  include: { course: { include: courseInclude } }
});
export const toggleLevel = (id, isActive) => prisma.courseLevel.update({
  where: { id },
  data: { isActive },
  include: { course: { include: courseInclude } }
});
export const deleteLevel = (id) => prisma.courseLevel.delete({ where: { id } });

// Lessons
export const createLessonForCourse = (courseId, data) => prisma.lesson.create({
  data: { ...data, courseId, courseLevelId: null },
  include: {
    course: { include: courseInclude },
    courseLevel: true
  }
});
export const createLessonForLevel = async (courseLevelId, data) => {
  const level = await prisma.courseLevel.findUnique({
    where: { id: courseLevelId },
    select: { courseId: true }
  });
  if (!level) throw new Error("المستوى غير موجود");

  return prisma.lesson.create({
    data: { ...data, courseId: level.courseId, courseLevelId },
    include: {
      course: { include: courseInclude },
      courseLevel: true
    }
  });
};

export const listLessonsByCourse = (courseId) => prisma.lesson.findMany({
  where: { courseId },
  orderBy: [{ courseLevelId: 'asc' }, { orderIndex: 'asc' }, { id: 'asc' }],
  include: {
    course: { include: courseInclude },
    courseLevel: true
  }
});
export const listLessonsByLevel = (courseLevelId) => prisma.lesson.findMany({
  where: { courseLevelId },
  orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }],
  include: {
    course: { include: courseInclude },
    courseLevel: true
  }
});
export const updateLesson = (id, data) => prisma.lesson.update({
  where: { id },
  data,
  include: {
    course: { include: courseInclude },
    courseLevel: true
  }
});
export const toggleLesson = (id, isActive) => prisma.lesson.update({
  where: { id },
  data: { isActive },
  include: {
    course: { include: courseInclude },
    courseLevel: true
  }
});
export const deleteLesson = (id) => prisma.lesson.delete({ where: { id } });

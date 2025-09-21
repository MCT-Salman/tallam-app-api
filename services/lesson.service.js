import prisma from "../prisma/client.js";

// Reusable include for nested course details
export const courseInclude = {
  subject: true,
  levels: {
    include: {
      instructor: true
    }
  },
};
// Levels
export const createLevel = (courseId, data) => prisma.courseLevel.create({
  data: { ...data, courseId },
  include: {
    course: {
      include: courseInclude
    },
    instructor: true         
  }
});

export const listLevelsByCourse = (courseId) => prisma.courseLevel.findMany({
  where: { courseId },
  orderBy: { order: "asc" },
  include: {
    course: {
      include: {
        subject: true,
        levels: {
          include: {
            instructor: true
          }
        }
      }
    },
    instructor:  true
  }
})

export const updateLevel = (id, data) => prisma.courseLevel.update({
  where: { id },
  data,
  include: {
    course: { include: courseInclude },
    instructor: true
  }
});

export const toggleLevel = (id, isActive) => prisma.courseLevel.update({
  where: { id },
  data: { isActive },
  include: { course: { include: courseInclude } }
});
export const deleteLevel = (id) => prisma.courseLevel.delete({ where: { id } });

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
      courseLevel: { include: { course: { include: courseInclude } } }
    }
  });
};
export const listLessonsByLevel = (courseLevelId) => prisma.lesson.findMany({
  where: { courseLevelId },
  orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }],
  include: {
    courseLevel: { include: { course: { include: courseInclude } } }
  }
});
export const updateLesson = (id, data) => prisma.lesson.update({
  where: { id },
  data,
  include: {
    courseLevel: { include: { course: { include: courseInclude } } }
  }
});
export const toggleLesson = (id, isActive) => prisma.lesson.update({
  where: { id },
  data: { isActive },
  include: {
    courseLevel: { include: { course: { include: courseInclude } } }
  }
});
export const deleteLesson = (id) => prisma.lesson.delete({ where: { id } });


/**
 * Public: list levels for a course filtered by instructor assigned to the level
 */
export const listLevelsByCourseAndInstructor = async (courseId, instructorId) => {
  return prisma.courseLevel.findMany({
    where: {
      courseId,
      instructorId,
      isActive: true,
    },
    orderBy: { order: 'asc' },
    include: {
      course: { include: courseInclude },
      instructor: { select: { id: true, name: true, avatarUrl: true } }
    }
  });
};

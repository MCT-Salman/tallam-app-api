import prisma from "../prisma/client.js";
import { sendNewLessonNotification } from './notification.service.js';

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

export const getLevelById = async (id) => {
  return prisma.courseLevel.findUnique({
    where: { id },
    include: {
      course: { select: courseSelect },
      instructor: true
    }
  });
};

export const createLevel = async (courseId, data) => {
  const level = await prisma.courseLevel.create({
    data: { ...data, courseId },
    include: {
      course: { select: courseSelect },
      instructor: true
    }
  });

  // Send new course level notification
  /* try {
     await sendNewCourseLevelNotification(level);
     console.log(`✅ تم إرسال إشعار المستوى الجديد: ${level.name}`);
   } catch (error) {
     console.error(`❌ فشل إرسال إشعار المستوى الجديد: ${error.message}`);
   }*/

  return level;
};

export const listLevelsByCourse = async (courseId, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;
  const take = limit;

  const [data, total] = await Promise.all([
    prisma.courseLevel.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        course: { select: courseSelect },
        instructor: true
      },
      skip,
      take
    }),
    prisma.courseLevel.count({ where: { courseId } })
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

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

  const lesson = await prisma.lesson.create({
    data: { ...data, courseLevelId },
    include: {
      courseLevel: { include: { course: { select: courseSelect } } }
    }
  });
  const count = await prisma.lesson.count({
    where: { courseLevelId }
  });
  if (count === 1) {
    try {
      await sendNewLessonNotification(lesson);
      console.log(`✅ Notification sent for new course: ${lesson.title}`);
    } catch (error) {
      console.error(`❌ Failed to send notification for new course: ${lesson.title}`, error.message);
    }
  }
  return lesson;
};

export const listLessonsByLevel = async (courseLevelId, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;
  const take = limit;

  const [data, total] = await Promise.all([
    prisma.lesson.findMany({
      where: { courseLevelId },
      orderBy: [{ orderIndex: "asc" }, { id: "asc" }],
      include: {
        courseLevel: { include: { course: { select: courseSelect } } }
      },
      skip,
      take
    }),
    prisma.lesson.count({ where: { courseLevelId } })
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

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
export const listLevelsByCourseAndInstructor = async (courseId, instructorId, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;
  const take = limit;

  const [data, total] = await Promise.all([
    prisma.courseLevel.findMany({
      where: {
        courseId,
        instructorId,
        isActive: true
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        order: true,
        imageUrl: true,
        course: { select: { id: true, title: true } },
        instructor: { select: { id: true, name: true, avatarUrl: true } }
      },
      skip,
      take
    }),
    prisma.courseLevel.count({
      where: {
        courseId,
        instructorId,
        isActive: true
      }
    })
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
/*
export const DetailLevel = async (courseLevelId, userId = null) => {
  const baseInclude = {
    course: {
      select: {
        id: true,
        title: true,
        description: true,
      }
    },
    instructor: {
      select: {
        id: true,
        name: true,
      }
    }
  };

  // Base query: always include level details and lesson names (without full details)
  const result = await prisma.courseLevel.findUnique({
    where: { id: courseLevelId },
    select: {
      id: true,
      name: true,
      description: true,
      priceUSD: true,
      priceSAR: true,
      previewUrl: true,
      order: true,
      imageUrl: true,
      ...baseInclude,
      lessons: {
        select: {
          id: true,
          title: true,
          description: true,
          durationSec: true,
          orderIndex: true,
          courseLevelId: true,
          isFreePreview: true,
        }
      }
    }
  });

  if (!result) {
    throw new Error("المستوى غير موجود");
  }
  // If user is not logged in, return basic details
  if (!userId) {
    return { ...result, issubscribed: false };
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
  if (accessCode || result.isFree) {
    const fullResult = await prisma.courseLevel.findUnique({
      where: { id: courseLevelId },
      select: {
        // الحقول المباشرة من CourseLevel
        id: true,
        name: true,
        description: true,
        priceUSD: true,
        priceSAR: true,
        previewUrl: true,
        order: true,
        ...baseInclude,
        lessons: {
          select: {
            id: true,
            title: true,
            description: true,
            durationSec: true,
            orderIndex: true,
            youtubeUrl: true,
            youtubeId: true,
            googleDriveUrl: true,
            courseLevelId: true,
            isFreePreview: true,
          },
        },
        /* files: {
           select: {
             id: true,
             url: true,
             name: true,
             type: true,
           },
         },
         quizzes: {
           select: {
             id: true,
             title: true,
           },
         },*/
/*   },
 });

 return { ...fullResult, issubscribed: true };
}
// Otherwise, return basic details
return { ...result, issubscribed: false };
};*/
export const DetailLevel = async (courseLevelId, userId = null) => {
  const baseInclude = {
    course: {
      select: {
        id: true,
        title: true,
        description: true,
      }
    },
    instructor: {
      select: {
        id: true,
        name: true,
      }
    }
  };

  const isDollar = await prisma.appSettings.findUnique({
    where: { key: "isDollar" },
    select: { value: true }
  });

  // جلب كل المعلومات الأساسية + الدروس مع كل الحقول الممكنة
  const result = await prisma.courseLevel.findUnique({
    where: { id: courseLevelId },
    select: {
      id: true,
      name: true,
      description: true,
      priceUSD: true,
      priceSAR: true,
      previewUrl: true,
      order: true,
      imageUrl: true,
      isFree: true,
      ...baseInclude,
      lessons: {
        select: {
          id: true,
          title: true,
          durationSec: true,
          orderIndex: true,
          courseLevelId: true,
          isFreePreview: true,
          youtubeUrl: true,
          youtubeId: true,
          googleDriveUrl: true,
        }
      }
    }
  });

  if (!result) throw new Error("المستوى غير موجود");

  // إذا المستخدم غير مسجل
  let isSubscribed = false;
  if (userId) {
    const accessCode = await prisma.accessCode.findFirst({
      where: {
        usedBy: userId,
        courseLevelId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    });
    if (accessCode || result.isFree) {
      isSubscribed = true;
    }
  }

  // فلترة الحقول الإضافية في الدروس حسب isFreePreview أو الاشتراك
  const lessons = result.lessons.map(lesson => {
    if (isSubscribed || lesson.isFreePreview) {
      // إذا مسموح، نرسل كل الحقول
      return lesson;
    } else {
      // إذا غير مسموح، نرسل فقط الحقول الأساسية
      const { id, title, durationSec, orderIndex, courseLevelId, isFreePreview } = lesson;
      return { id, title, durationSec, orderIndex, courseLevelId, isFreePreview };
    }
  });

  let review = false;
  let existingResult = false;
  if (userId) {
    review = !!(await prisma.review.findFirst({
      where: { userId, courseLevelId }
    }));

    existingResult = !!(await prisma.quizResult.findFirst({
      where: { courseLevelId, userId },
    }));
  }

  return { ...result, lessons, issubscribed: isSubscribed, isDollar: isDollar.value === 'true', review, existingResult };
};

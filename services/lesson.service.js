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
  const existingLevel = await prisma.courseLevel.findFirst({
    where: { courseId, instructorId: data.instructorId, order: data.order }
  });
  if (existingLevel) throw new Error("هذا الترتيب مستخدم مسبقًا في هذا الدورة لنفس المدرس");
  const level = await prisma.courseLevel.create({
    data: { ...data, courseId },
    include: {
      course: { select: courseSelect },
      instructor: true
    }
  });
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
  const existingLesson = await prisma.lesson.findFirst({
    where: { courseLevelId, orderIndex: data.orderIndex }
  });
  if (existingLesson) throw new Error("يوجد درس بنفس الترتيب في هذا المستوى");

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

  let isDollar = true;

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
    const usercountry = await prisma.user.findUnique({
      where: { id: userId },
      select: { country: true }
    });
    if (usercountry.country === 'SAR' || usercountry.country === 'Syria' || usercountry.country === 'سوريا') {
      isDollar = false;
    } else {
      isDollar = true;
    }
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

  return { ...result, lessons, issubscribed: isSubscribed, isDollar, review, existingResult };
};*/
export const DetailLevel = async (courseLevelId, userId = null) => {
  let isDollar = true;

  const result = await prisma.courseLevel.findUnique({
    where: { id: courseLevelId },
    include: {
      course: { select: { id: true, title: true, description: true } },
      instructor: { select: { id: true, name: true } },
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
        },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!result) throw new Error("المستوى غير موجود");

  let isSubscribed = false;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { country: true },
    });

    const country = user?.country?.toLowerCase();
    isDollar = !(country === 'sar' || country === 'syria' || country === 'سوريا');

    const accessCode = await prisma.accessCode.findFirst({
      where: {
        usedBy: userId,
        courseLevelId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    isSubscribed = !!(accessCode || result.isFree);
  }

  const lessons = result.lessons.map(({ isFreePreview, ...rest }) =>
    (isSubscribed || isFreePreview)
      ? { isFreePreview, ...rest }
      : {
        id: rest.id,
        title: rest.title,
        durationSec: rest.durationSec,
        orderIndex: rest.orderIndex,
        courseLevelId: rest.courseLevelId,
        isFreePreview,
      }
  );

  let hasReview = false;
  let hasQuizResult = false;

  if (userId) {
    const [review, quizResult] = await Promise.all([
      prisma.review.findFirst({ where: { userId, courseLevelId } }),
      prisma.quizResult.findFirst({ where: { courseLevelId, userId } }),
    ]);
    hasReview = !!review;
    hasQuizResult = !!quizResult;
  }

  return { ...result, lessons, isSubscribed, isDollar, hasReview, hasQuizResult };
};


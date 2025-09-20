import prisma from "../prisma/client.js";

/**
 * إنشاء علاقة جديدة بين مستوى الدورة والمدرب
 * @param {object} data - بيانات العلاقة { courseLevelId, instructorId }
 * @returns {Promise<import('@prisma/client').CourseLevelInstructor>}
 */
export const create = (data) => {
  return prisma.courseLevelInstructor.create({ data });
};

/**
 * إنشاء عدة علاقات دفعة واحدة
 * @param {object[]} data - مصفوفة من بيانات العلاقات
 * @returns {Promise<{count: number}>}
 */
export const createMany = (data) => {
  return prisma.courseLevelInstructor.createMany({ 
    data, 
    skipDuplicates: true 
  });
};

/**
 * العثور على علاقة محددة
 * @param {number} courseLevelId - معرف مستوى الدورة
 * @param {number} instructorId - معرف المدرب
 * @returns {Promise<import('@prisma/client').CourseLevelInstructor | null>}
 */
export const findUnique = (courseLevelId, instructorId) => {
  return prisma.courseLevelInstructor.findUnique({
    where: {
      courseLevelId_instructorId: {
        courseLevelId,
        instructorId
      }
    }
  });
};

/**
 * الحصول على جميع المدربين لمستوى دورة محدد
 * @param {number} courseLevelId - معرف مستوى الدورة
 * @returns {Promise<import('@prisma/client').CourseLevelInstructor[]>}
 */
export const findByCourseLevelId = (courseLevelId) => {
  return prisma.courseLevelInstructor.findMany({
    where: { courseLevelId },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          bio: true,
          avatarUrl: true,
          isActive: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
};

/**
 * الحصول على جميع مستويات الدورات لمدرب محدد
 * @param {number} instructorId - معرف المدرب
 * @returns {Promise<import('@prisma/client').CourseLevelInstructor[]>}
 */
export const findByInstructorId = (instructorId) => {
  return prisma.courseLevelInstructor.findMany({
    where: { instructorId },
    include: {
      courseLevel: {
        select: {
          id: true,
          name: true,
          order: true,
          courseId: true,
          isActive: true,
          course: {
            select: {
              id: true,
              title: true,
              description: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
};

/**
 * حذف علاقة محددة
 * @param {number} courseLevelId - معرف مستوى الدورة
 * @param {number} instructorId - معرف المدرب
 * @returns {Promise<import('@prisma/client').CourseLevelInstructor>}
 */
export const deleteUnique = (courseLevelId, instructorId) => {
  return prisma.courseLevelInstructor.delete({
    where: {
      courseLevelId_instructorId: {
        courseLevelId,
        instructorId
      }
    }
  });
};

/**
 * حذف جميع المدربين من مستوى دورة محدد
 * @param {number} courseLevelId - معرف مستوى الدورة
 * @returns {Promise<{count: number}>}
 */
export const deleteByCourseLevelId = (courseLevelId) => {
  return prisma.courseLevelInstructor.deleteMany({
    where: { courseLevelId }
  });
};

/**
 * حذف جميع مستويات الدورات لمدرب محدد
 * @param {number} instructorId - معرف المدرب
 * @returns {Promise<{count: number}>}
 */
export const deleteByInstructorId = (instructorId) => {
  return prisma.courseLevelInstructor.deleteMany({
    where: { instructorId }
  });
};

/**
 * تحديث مدربي مستوى دورة محدد
 * @param {number} courseLevelId - معرف مستوى الدورة
 * @param {number[]} instructorIds - مصفوفة معرفات المدربين الجديدة
 * @returns {Promise<{deleted: {count: number}, created: {count: number}}>}
 */
export const updateCourseLevelInstructors = async (courseLevelId, instructorIds) => {
  return prisma.$transaction(async (tx) => {
    // حذف جميع المدربين الحاليين
    const deleted = await tx.courseLevelInstructor.deleteMany({
      where: { courseLevelId }
    });

    // إضافة المدربين الجدد
    const created = await tx.courseLevelInstructor.createMany({
      data: instructorIds.map(instructorId => ({
        courseLevelId,
        instructorId
      })),
      skipDuplicates: true
    });

    return { deleted, created };
  });
};

/**
 * تحديث مستويات الدورات لمدرب محدد
 * @param {number} instructorId - معرف المدرب
 * @param {number[]} courseLevelIds - مصفوفة معرفات مستويات الدورات الجديدة
 * @returns {Promise<{deleted: {count: number}, created: {count: number}}>}
 */
export const updateInstructorCourseLevels = async (instructorId, courseLevelIds) => {
  return prisma.$transaction(async (tx) => {
    // حذف جميع مستويات الدورات الحالية
    const deleted = await tx.courseLevelInstructor.deleteMany({
      where: { instructorId }
    });

    // إضافة مستويات الدورات الجديدة
    const created = await tx.courseLevelInstructor.createMany({
      data: courseLevelIds.map(courseLevelId => ({
        courseLevelId,
        instructorId
      })),
      skipDuplicates: true
    });

    return { deleted, created };
  });
};

/**
 * التحقق من وجود علاقة بين مستوى دورة ومدرب
 * @param {number} courseLevelId - معرف مستوى الدورة
 * @param {number} instructorId - معرف المدرب
 * @returns {Promise<boolean>}
 */
export const exists = async (courseLevelId, instructorId) => {
  const relation = await findUnique(courseLevelId, instructorId);
  return !!relation;
};

/**
 * عدد المدربين في مستوى دورة محدد
 * @param {number} courseLevelId - معرف مستوى الدورة
 * @returns {Promise<number>}
 */
export const countInstructorsByCourseLevelId = (courseLevelId) => {
  return prisma.courseLevelInstructor.count({
    where: { courseLevelId }
  });
};

/**
 * عدد مستويات الدورات لمدرب محدد
 * @param {number} instructorId - معرف المدرب
 * @returns {Promise<number>}
 */
export const countCourseLevelsByInstructorId = (instructorId) => {
  return prisma.courseLevelInstructor.count({
    where: { instructorId }
  });
};

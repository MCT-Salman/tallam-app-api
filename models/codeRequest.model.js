import prisma from "../prisma/client.js";

/**
 * إنشاء طلب كود جديد
 * @param {object} data - بيانات الطلب { userId, courseId, contact }
 * @returns {Promise<import('@prisma/client').CodeRequest>}
 */
export const create = (data) => {
  return prisma.codeRequest.create({ data });
};

/**
 * العثور على طلب بواسطة المعرف
 * @param {number} id - معرف الطلب
 * @returns {Promise<import('@prisma/client').CodeRequest | null>}
 */
export const findById = (id) => {
  return prisma.codeRequest.findUnique({ where: { id } });
};

/**
 * تحديث طلب بواسطة المعرف
 * @param {number} id - معرف الطلب
 * @param {object} data - البيانات الجديدة
 * @returns {Promise<import('@prisma/client').CodeRequest>}
 */
export const updateById = (id, data) => {
  return prisma.codeRequest.update({ where: { id }, data });
};

/**
 * العثور على أول طلب يطابق الشروط
 * @param {object} args - Prisma findFirst args
 * @returns {Promise<import('@prisma/client').CodeRequest | null>}
 */
export const findFirst = (args) => {
  return prisma.codeRequest.findFirst(args);
};

/**
 * عد جميع الطلبات التي تطابق الشروط
 * @param {object} where - Prisma where clause
 * @returns {Promise<number>}
 */
export const count = (where = {}) => {
  return prisma.codeRequest.count({ where });
};

/**
 * الحصول على جميع الطلبات مع معلومات المستخدم والدورة
 * @param {object} where - شروط الفلترة
 * @returns {Promise<import('@prisma/client').CodeRequest[]>}
 */
export const findAll = (where = {}) => {
  return prisma.codeRequest.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, phone: true },
      },
      course: {
        select: { id: true, title: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

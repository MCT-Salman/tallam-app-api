// هذا الملف فقط للتوضيح كيف نتعامل مع المستخدم عبر Prisma
import prisma from "../prisma/client.js";

export const findUserByPhone = (phone) => {
  return prisma.user.findUnique({ where: { phone } });
};

export const createUser = (data) => {
  return prisma.user.create({ data });
};

export const findById = (id, select = undefined) => {
  return prisma.user.findUnique({ where: { id }, ...(select ? { select } : {}) });
};

export const findByPhone = (phone, select = undefined) => {
  return prisma.user.findUnique({ where: { phone }, ...(select ? { select } : {}) });
};

export const updateById = (id, data, select = undefined) => {
  return prisma.user.update({ where: { id }, data, ...(select ? { select } : {}) });
};

// تحديث آمن للملف الشخصي: يمنع تعديل passwordHash مباشرة هنا
export const updateSafeProfile = (id, data, select = undefined) => {
  const { passwordHash, ...safe } = data || {};
  return prisma.user.update({ where: { id }, data: safe, ...(select ? { select } : {}) });
};

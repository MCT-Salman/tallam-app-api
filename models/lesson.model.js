import prisma from "../prisma/client.js";

export const create = (data) => prisma.lesson.create({ data });
export const findAllByCourse = (courseId) => prisma.lesson.findMany({ where: { courseId }, orderBy: [{ levelId: 'asc' }, { orderIndex: 'asc' }, { id: 'asc' }] });
export const findAllByLevel = (levelId) => prisma.lesson.findMany({ where: { levelId }, orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }] });
export const findById = (id, select) => prisma.lesson.findUnique({ where: { id }, ...(select ? { select } : {}) });
export const updateById = (id, data, select) => prisma.lesson.update({ where: { id }, data, ...(select ? { select } : {}) });
export const toggleActive = (id, isActive = true) => prisma.lesson.update({ where: { id }, data: { isActive } });

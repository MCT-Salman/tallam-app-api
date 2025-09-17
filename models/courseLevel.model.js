import prisma from "../prisma/client.js";

export const create = (data) => prisma.courseLevel.create({ data });
export const findAllByCourse = (courseId) => prisma.courseLevel.findMany({ where: { courseId }, orderBy: { order: "asc" } });
export const findById = (id, select) => prisma.courseLevel.findUnique({ where: { id }, ...(select ? { select } : {}) });
export const updateById = (id, data, select) => prisma.courseLevel.update({ where: { id }, data, ...(select ? { select } : {}) });
export const toggleActive = (id, isActive = true) => prisma.courseLevel.update({ where: { id }, data: { isActive } });

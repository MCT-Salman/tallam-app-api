import prisma from "../prisma/client.js";

export const create = (data) => prisma.instructor.create({ data });
export const findAll = (where = {}, select) => prisma.instructor.findMany({ where, orderBy: { name: "asc" }, ...(select ? { select } : {}) });
export const findById = (id, select) => prisma.instructor.findUnique({ where: { id }, ...(select ? { select } : {}) });
export const updateById = (id, data, select) => prisma.instructor.update({ where: { id }, data, ...(select ? { select } : {}) });
export const toggleActive = (id, isActive = true) => prisma.instructor.update({ where: { id }, data: { isActive } });

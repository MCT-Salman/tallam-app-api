import prisma from "../prisma/client.js";

export const create = (data) => prisma.subject.create({ data });
export const findAll = (where = {}, select) => prisma.subject.findMany({ where, orderBy: { name: "asc" }, ...(select ? { select } : {}) });
export const findById = (id, select) => prisma.subject.findUnique({ where: { id }, ...(select ? { select } : {}) });
export const updateById = (id, data, select) => prisma.subject.update({ where: { id }, data, ...(select ? { select } : {}) });
export const toggleActive = (id, isActive = true) => prisma.subject.update({ where: { id }, data: { isActive } });

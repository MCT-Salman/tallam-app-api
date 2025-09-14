import prisma from "../prisma/client.js";

export const create = (data) => prisma.domain.create({ data });
export const findAll = (where = {}, select) => prisma.domain.findMany({ where, orderBy: { name: "asc" }, ...(select ? { select } : {}) });
export const findById = (id, select) => prisma.domain.findUnique({ where: { id }, ...(select ? { select } : {}) });
export const updateById = (id, data, select) => prisma.domain.update({ where: { id }, data, ...(select ? { select } : {}) });
export const toggleActive = (id, isActive = true) => prisma.domain.update({ where: { id }, data: { isActive } });

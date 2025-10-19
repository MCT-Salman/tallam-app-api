import prisma from "../prisma/client.js";

export const create = (data) => prisma.course.create({ data });
export const findAll = (where = {}, select, orderBy = { createdAt: "desc" }, skip = 0, take = 20) =>
  prisma.course.findMany({ where, orderBy, skip, take, ...(select ? { select } : {}), });
export const count = (where = {}) => prisma.course.count({ where });
export const findById = (id, select) => prisma.course.findUnique({ where: { id }, ...(select ? { select } : {}) });
export const updateById = (id, data, select) => prisma.course.update({ where: { id }, data, ...(select ? { select } : {}) });
export const toggleActive = (id, isActive = true) => prisma.course.update({ where: { id }, data: { isActive } });

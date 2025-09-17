import prisma from "../prisma/client.js";

export const create = (data) => prisma.specialization.create({ data });
export const findAllByDomain = (domainId) =>
  prisma.specialization.findMany({ where: { domainId }, orderBy: { name: "asc" } });
export const findAll = (where = {}, select) =>
  prisma.specialization.findMany({ where, orderBy: { name: "asc" }, ...(select ? { select } : {}) });
export const findById = (id, select) =>
  prisma.specialization.findUnique({ where: { id }, ...(select ? { select } : {}) });
export const updateById = (id, data, select) =>
  prisma.specialization.update({ where: { id }, data, ...(select ? { select } : {}) });
export const toggleActive = (id, isActive = true) =>
  prisma.specialization.update({ where: { id }, data: { isActive } });

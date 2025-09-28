import prisma from "../prisma/client.js";

export const createFile = async (data) => {
  return prisma.file.create({ data });
};

export const listFiles = async (filters = {}, pagination = {}) => {
  const { courseLevelId } = filters;
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;
  const take = limit;

  const where = {};
  if (courseLevelId) where.courseLevelId = courseLevelId;

  const [items, total] = await Promise.all([
    prisma.file.findMany({ where, orderBy: { id: "desc" }, skip, take }),
    prisma.file.count({ where })
  ]);

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getFileById = (id) => prisma.file.findUnique({ where: { id } });

export const updateFile = (id, data) => prisma.file.update({ where: { id }, data });

export const deleteFile = (id) => prisma.file.delete({ where: { id } });

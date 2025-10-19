import prisma from '../prisma/client.js';

export const findFirst = (args) => {
  return prisma.lessonProgress.findFirst(args);
};

export const create = (data) => prisma.lessonProgress.create({ data });

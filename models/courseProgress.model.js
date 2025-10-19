import prisma from '../prisma/client.js';

export const findFirst = (args) => {
  return prisma.courseProgress.findFirst(args);
};

export const upsert = (args) => {
  return prisma.courseProgress.upsert(args);
};

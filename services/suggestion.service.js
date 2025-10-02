import prisma from "../prisma/client.js";

export const createSuggestion = async (userId, { message, courseLevelId = null }) => {
  return prisma.suggestion.create({
    data: {
      userId,
      message,
      courseLevelId: courseLevelId ?? null,
    },
    include: {
      user: { select: { id: true, name: true, phone: true } },
      courseLevel: { select: { id: true, name: true } },
    },
  });
};

export const listSuggestions = async ({ userId, courseLevelId, skip = 0, take = 20 }) => {
  const where = {
    ...(userId ? { userId: Number(userId) } : {}),
    ...(courseLevelId ? { courseLevelId: Number(courseLevelId) } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.suggestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        courseLevel: { select: { id: true, name: true } },
      },
      skip: Number(skip) || 0,
      take: Math.min(Number(take) || 20, 100),
    }),
    prisma.suggestion.count({ where })
  ]);

  return { items, total, skip: Number(skip) || 0, take: Math.min(Number(take) || 20, 100) };
};

export const getSuggestionById = async (id) => {
  return prisma.suggestion.findUnique({
    where: { id: Number(id) },
    include: {
      user: { select: { id: true, name: true, phone: true } },
      courseLevel: { select: { id: true, name: true } },
    },
  });
};

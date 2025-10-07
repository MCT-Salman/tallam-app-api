import prisma from "../prisma/client.js";

export const createStory = async (data) => {
  return prisma.story.create({ data });
};

export const listStories = async (pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;
  const take = limit;

  const [items, total] = await Promise.all([
    prisma.story.findMany({
      orderBy: { id: "desc" },
      skip,
      take
    }),
    prisma.story.count()
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

export const getStoryById = (id) => prisma.story.findUnique({ where: { id } });

export const updateStory = (id, data) => prisma.story.update({ where: { id }, data });

export const deleteStory = (id) => prisma.story.delete({ where: { id } });

export const getActiveStories = async () => {
  const now = new Date();
  return prisma.story.findMany({
    where: {
      isActive: true,
      OR: [
        { startedAt: null, endedAt: null },
        {
          startedAt: { lte: now },
          OR: [
            { endedAt: null },
            { endedAt: { gte: now } }
          ]
        }
      ]
    },
    orderBy: { orderIndex: "asc" }
  });
};

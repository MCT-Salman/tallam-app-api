import prisma from "../prisma/client.js";

export const findByuserId = (userId) => prisma.session.findFirst({
  where: { userId: userId }
});

export const createSession = (data) => prisma.session.create({ data });

export const revokeOtherSessions = (userId, keepSessionId) =>
  prisma.session.updateMany({
    where: { userId, revokedAt: null, NOT: { id: keepSessionId } },
    data: { revokedAt: new Date() },
  });

export const revokeAllSessions = (userId) =>
  prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });

export const findActiveSessionsByUser = (userId) =>
  prisma.session.findMany({
    where: { userId, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userAgent: true,
      ip: true,
      realIp: true,
      location: true,
      deviceInfo: true,
      createdAt: true,
    },
  });

export const revokeSessionById = (id) =>
  prisma.session.update({ where: { id }, data: { revokedAt: new Date() } });


export const deleteByuserId = (userId) =>
  prisma.session.deleteMany({ where: { userId } });

export const deleteallsessions = () =>
  prisma.session.deleteMany();

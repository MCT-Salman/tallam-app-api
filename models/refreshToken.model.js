import prisma from "../prisma/client.js";

export const createRefreshToken = (data) => prisma.refreshToken.create({ data });

export const revokeRefreshTokenByHash = (tokenHash) =>
  prisma.refreshToken.update({
    where: { tokenHash },
    data: { isRevoked: true, revokedAt: new Date() },
  });

export const revokeAllUserTokens = (userId) =>
  prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true, revokedAt: new Date() },
  });

export const revokeUserTokensExceptSession = (userId, sessionId) =>
  prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false, NOT: { sessionId } },
    data: { isRevoked: true, revokedAt: new Date() },
  });

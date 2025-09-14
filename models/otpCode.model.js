import prisma from "../prisma/client.js";

export const createOtp = (phone, code, expiresAt) =>
  prisma.otpCode.create({ data: { phone, code, expiresAt } });

export const findLatestOtp = (phone) =>
  prisma.otpCode.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } });

export const markOtpUsed = (id) =>
  prisma.otpCode.update({ where: { id }, data: { used: true } });

export const markOtpUnUsed = (phone) =>
  prisma.otpCode.updateMany({
    where: { phone, used: true },
    data: { used: false }
  });

  export const markOtpUsedByPhone = (phone) =>
  prisma.otpCode.updateMany({
    where: { phone, used: false },
    data: { used: true }
  });

export const incrementOtpAttempts = (id) =>
  prisma.otpCode.update({ where: { id }, data: { attempts: { increment: 1 } } });

export const findForVerify = (phone, code) =>
  prisma.otpCode.findFirst({
    where: { phone, code, used: false },
    orderBy: { createdAt: "desc" }
  });

  export const findForVerifeidNumber = (phone) =>
  prisma.otpCode.findFirst({
    where: { phone, used: true },
    orderBy: { createdAt: "desc" }
  });
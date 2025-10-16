import { console } from "inspector";
import prisma from "../prisma/client.js";

// -------- Admin Services --------
export const createCoupon = async ({ code, discount, isPercent = true, expiry, maxUsage, isActive = true, courseLevelId, createdBy }) => {
  const data = {
    code: code.trim().toUpperCase(),
    discount: parseFloat(discount),
    isPercent: Boolean(isPercent),
    expiry: expiry ? new Date(expiry) : null,
    maxUsage: maxUsage != null ? Number(maxUsage) : null,
    isActive: Boolean(isActive),
    courseLevelId: Number(courseLevelId),
    createdBy: createdBy ?? null,
  };
  return prisma.coupon.create({ data });
};

export const listCoupons = async ({ skip = 0, take = 50 } = {}) => {
  return prisma.coupon.findMany({
    skip: Number(skip),
    take: Number(take),
    orderBy: { createdAt: "desc" },
    include: { courseLevel: { include: { course: true } } },
  });
};

export const getCouponById = async (id) => {
  return prisma.coupon.findUnique({
    where: { id: Number(id) },
    include: { courseLevel: { include: { course: true } }, transaction: true },
  });
};

export const updateCoupon = async (id, data) => {
  const update = { ...data };
  if (update.code) update.code = update.code.trim().toUpperCase();
  if (update.discount != null) update.discount = parseFloat(update.discount);
  if (update.isPercent != null) update.isPercent = Boolean(update.isPercent);
  if (update.expiry !== undefined) update.expiry = update.expiry ? new Date(update.expiry) : null;
  if (update.maxUsage !== undefined) update.maxUsage = update.maxUsage != null ? Number(update.maxUsage) : null;
  if (update.isActive != null) update.isActive = Boolean(update.isActive);
  if (update.courseLevelId != null) update.courseLevelId = Number(update.courseLevelId);

  return prisma.coupon.update({ where: { id: Number(id) }, data: update });
};

export const deleteCoupon = async (id) => {
  return prisma.coupon.delete({ where: { id: Number(id) } });
};

export const listCouponsByCourseLevel = async (courseLevelId) => {
  return prisma.coupon.findMany({
    where: { courseLevelId: Number(courseLevelId) },
    orderBy: { createdAt: "desc" },
  });
};

// -------- Student Services --------
const baseCouponWhere = (code, courseLevelId) => ({
  code: code.trim().toUpperCase(),
  courseLevelId: Number(courseLevelId),
  isActive: true,
});

export const validateCoupon = async ({ code, courseLevelId }) => {
  const now = new Date();
  const coupon = await prisma.coupon.findFirst({ where: baseCouponWhere(code, courseLevelId) });
  if (!coupon) throw new Error("الكوبون غير صالح لهذا المستوى أو غير نشط.");
  if (coupon.expiry && now > coupon.expiry) throw new Error("انتهت صلاحية هذا الكوبون.");
  if (coupon.maxUsage != null && coupon.usedCount >= coupon.maxUsage) throw new Error("تم استهلاك الحد الأقصى لهذا الكوبون.");
  return coupon;
};

export const applyCoupon = async ({ code, courseLevelId }) => {
  const coupon = await validateCoupon({ code, courseLevelId });

  const price = await prisma.courseLevel.findUnique({
    where: { id: courseLevelId },
    select: { priceUSD: true, priceSAR: true }
  });

  const isDollar = await prisma.appSettings.findUnique({ // تأكد من الاسم هنا
    where: { key: "isDollar" },
    select: { value: true }
  });

  let finalPrice = isDollar.value === 'true' ? price.priceUSD : price.priceSAR;

  if (coupon.isPercent) {
    finalPrice = finalPrice - (finalPrice * (coupon.discount / 100));
  } else {
    finalPrice = finalPrice - coupon.discount;
  }

  const updated = await prisma.coupon.update({
    where: { id: coupon.id },
    data: { usedCount: { increment: 1 } },
  });

  return { ...updated, finalPrice };
};


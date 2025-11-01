import { console } from "inspector";
import prisma from "../prisma/client.js";
import { disconnect } from "process";

// -------- Admin Services --------
export const createCoupon = async ({ code, discount, isPercent = true, expiry, maxUsage, isActive = true, courseLevelId, userId, reason, point, createdBy }) => {
  if (point === true) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true }
    });
    if (!user) throw new Error('المستخدم غير موجود');
    if (user.points < 5) throw new Error('لا يوجد نقاط كافية');
    await prisma.user.update({
      where: { id: userId },
      data: { points: user.points - 5 }
    });
    maxUsage = 1;
  }
  const data = {
    code: code.trim().toUpperCase(),
    discount: parseFloat(discount),
    isPercent: Boolean(isPercent),
    expiry: expiry ? new Date(expiry) : null,
    maxUsage: maxUsage != null ? Number(maxUsage) : null,
    isActive: Boolean(isActive),
    courseLevelId: Number(courseLevelId) ?? null,
    userId: Number(userId) ?? null,
    reason: reason ?? null,
    createdBy: createdBy ?? null,
  };
  return prisma.coupon.create({ data });
};

export const listCoupons = async ({ skip = 0, take = 50 } = {}) => {
  return prisma.coupon.findMany({
    skip: Number(skip),
    take: Number(take),
    orderBy: { createdAt: "desc" },
    include: { courseLevel: { include: { course: true, instructor: { include: { specialization: true } } } } },
  });
};

export const getCouponById = async (id) => {
  return prisma.coupon.findUnique({
    where: { id: Number(id) },
    include: { courseLevel: { include: { course: true } }, transaction: true },
  });
};

export const updateCoupon = async (id, data) => {
  const couponId = Number(id);
  if (isNaN(couponId)) throw new Error("رقم الكوبون غير صالح");

  const update = { ...data };

  // تنسيق الكود
  if (update.code) {
    update.code = update.code.trim().toUpperCase();

    // تحقق من تكرار الكود
    const existing = await prisma.coupon.findUnique({ where: { code: update.code } });
    if (existing && existing.id !== couponId) {
      throw new Error("هذا الكود مستخدم مسبقًا لكوبون آخر");
    }
  }

  if (update.discount != null) update.discount = parseFloat(update.discount);
  if (update.isPercent != null) update.isPercent = Boolean(update.isPercent);
  if (update.expiry !== undefined) update.expiry = update.expiry ? new Date(update.expiry) : null;
  if (update.maxUsage !== undefined) update.maxUsage = update.maxUsage != null ? Number(update.maxUsage) : null;
  if (update.isActive != null) update.isActive = Boolean(update.isActive);
  //if (update.courseLevelId != null) update.courseLevelId = Number(update.courseLevelId);
  //if (update.userId != null) update.userId = Number(update.userId);
  if (update.reason != null) update.reason = update.reason;

  const existingCoupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!existingCoupon) throw new Error("الكوبون غير موجود");

  return prisma.coupon.update({ where: { id: couponId }, data: update });
};



export const deleteCoupon = async (id) => {
  return prisma.coupon.delete({ where: { id: Number(id) } });
};

export const listCouponsByUserOrLevel = async ({ skip = 0, take = 50, userId, courseLevelId, maxUsage = Infinity } = {}) => {
  const where = {
    isActive: true,
    AND: [
      {
        OR: [
          { userId: Number(userId) || undefined },
          { userId: null },
        ],
      },
      {
        OR: [
          { courseLevelId: Number(courseLevelId) || undefined },
          { courseLevelId: null },
        ],
      },
    ],
  };

  const coupons = await prisma.coupon.findMany({
    where,
    skip: Number(skip),
    take: Number(take),
    orderBy: { createdAt: "desc" }
  });

  return coupons.filter(coupon => coupon.usedCount < coupon.maxUsage);
};


export const listCouponsByCourseLevel = async (courseLevelId) => {
  return prisma.coupon.findMany({
    where: { courseLevelId: Number(courseLevelId) },
    orderBy: { createdAt: "desc" },
  });
};

export const getFinalPriceWithCoupon = async ({ couponId, courseLevelId }) => {
  // تحويل المعرفات لأرقام والتحقق
  const cLevelId = Number(courseLevelId);
  const cId = Number(couponId);
  if (isNaN(cLevelId) || isNaN(cId)) throw new Error("معرف الكورس أو الكوبون غير صالح");

  // استخدام transaction لجلب البيانات دفعة واحدة
  const [price, usercountry, coupon] = await prisma.$transaction([
    prisma.courseLevel.findUnique({
      where: { id: cLevelId },
      select: { priceUSD: true, priceSAR: true }
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { country: true }
    }),
    prisma.coupon.findUnique({
      where: { id: cId }
    })
  ]);

  let isDollar = true;
  if (usercountry.country === 'SAR' || usercountry.country === 'Syria' || usercountry.country === 'سوريا') {
    isDollar = false;
  } else {
    isDollar = true;
  }
  if (!price) throw new Error("مستوى الكورس غير موجود");
  if (!coupon) throw new Error("الكوبون غير موجود");

  // حساب السعر الأساسي حسب العملة
  let finalPrice = isDollar ? price.priceUSD : price.priceSAR;
  const basePrice = finalPrice;

  // تطبيق الخصم
  if (coupon.isPercent) {
    finalPrice = finalPrice - (finalPrice * (coupon.discount / 100));
  } else {
    finalPrice = finalPrice - coupon.discount;
  }

  // منع السعر النهائي من أن يصبح سالب
  finalPrice = finalPrice < 0 ? 0 : finalPrice;

  return { finalPrice, basePrice, discount: coupon.discount, isPercent: coupon.isPercent };
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
  let isDollar = true;
  const usercountry = await prisma.user.findUnique({
    where: { id: userId },
    select: { country: true }
  });

  const country = usercountry?.country?.toLowerCase();
  isDollar = !(country === 'sar' || country === 'syria' || country === 'سوريا');

  let finalPrice = isDollar ? price.priceUSD : price.priceSAR;

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

export const listactiveCouponsByCourseLevel = async (courseLevelId) => {
  const coupons = await prisma.coupon.findMany({
    where: {
      courseLevelId: Number(courseLevelId),
      isActive: true,
      expiry: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  return coupons.filter(c => c.usedCount < c.maxUsage)
};


export const listUsers = async () => {
  return prisma.user.findMany({
    where: {
      role: "STUDENT",
      points: { gte: 5 }
    },
    select: { id: true, name: true, points: true },
  });
};

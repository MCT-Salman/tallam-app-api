import { customAlphabet } from 'nanoid';
import prisma from "../prisma/client.js";
import { sendCourseSubscriptionNotification } from './notification.service.js';
import { addDays } from 'date-fns';

// Define a custom alphabet for generating codes (uppercase letters and numbers, no ambiguous chars)
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 10);

/**
 * Generate unique access codes for a course or a specific course level.
 * At least one of courseId or courseLevelId must be provided.
 * If courseLevelId is provided, it takes precedence and courseId is derived from the level.
 * @param {Object} params
 * @param {number | undefined} params.courseId
 * @param {number | undefined} params.courseLevelId
 * @param {number} params.validityInMonths - How many months the code is valid for after activation.
 * @param {number} params.issuedBy - The ID of the admin who issued the codes.
 * @returns {Promise<string[]>} - Array of generated codes.
 */
export const generateAccessCodes = async ({
  courseLevelId, userId, validityInMonths, issuedBy, couponId, status, amountPaid, receiptImageUrl, notes }) => {
    console.log(status);
  // Validate level exists and implicitly validate course via level
  const level = await prisma.courseLevel.findUnique({
    where: { id: courseLevelId },
    select: { id: true, courseId: true }
  });
  if (!level) throw new Error('المستوى غير موجود');

  // Generate a unique access code
  const code = nanoid();

  // Create the access code
  const accessCode = await prisma.accessCode.create({
    data: {
      code,
      courseLevelId,
      issuedBy,
      validityInMonths,
      usedBy: userId,
      status
    }
  });

  // Create the financial account entry
  await prisma.transaction.create({
    data: {
      receiptImageUrl,
      amountPaid: parseFloat(amountPaid),
      notes,
      accessCodeId: accessCode.id,
      couponId: couponId
    }
  });
  return accessCode;
};

export const getAllAccessCodes = async () => {
  return await prisma.accessCode.findMany({
    include: {
      courseLevel: {
        include: {
          course: {
            include: {
              specialization: true
            }
          },
          instructor: true,
        }
      },
      user: { select: { id: true, name: true, phone: true } },
      transaction: {
        include: {
          coupon: true,
        }
      }
    },
    orderBy: { issuedAt: 'desc' }
  });
};

/**
 * Activate an access code for a user.
 * @param {string} code - The access code string.
 * @param {number} userId - The ID of the user activating the code.
 * @param {number} courseLevelId - The ID of the course level.
 * @returns {Promise<import('@prisma/client').AccessCode>}
 */
export const activateCode = async (code, userId, courseLevelId, tx = prisma) => {
  // 1️⃣ جلب الكود مع التحقق
  const existingAccessCode = await tx.accessCode.findFirst({
    where: { code, usedBy: userId, courseLevelId },
  });

  if (!existingAccessCode) throw new Error('الكود غير صحيح أو لا ينتمي لهذا المستوى.');
  if (existingAccessCode.used) throw new Error('هذا الكود تم استخدامه مسبقاً.');

  // 2️⃣ حساب تاريخ الانتهاء
  let expiresAt = null;
  if (existingAccessCode.validityInMonths) {
    const days = existingAccessCode.validityInMonths * 30.44; // متوسط الأيام لكل شهر
    expiresAt = addDays(new Date(), days);
  }
  
  // 3️⃣ تحديث الكود فقط داخل transaction
  const updatedCode = await tx.accessCode.update({
    where: { id: existingAccessCode.id },
    data: {
      usedAt: new Date(),
      used: true,
      status: 'USED',
      expiresAt,
    },
  });

  return updatedCode; // ✅ لا ترسل إشعار هنا داخل transaction
};

/**
 * Get all access codes for a specific course (for admins).
 * @param {number} courseId
 * @returns {Promise<import('@prisma/client').AccessCode[]>}
 */
export const getAccessCodesByCourse = async (courseId) => {
  return prisma.accessCode.findMany({
    where: { courseLevel: { courseId } },
    include: {
      courseLevel: { select: { id: true, name: true, courseId: true, course: { select: { id: true, title: true, specialization: { select: { id: true, name: true } } } } } },
      transaction: {
        include: {
          coupon: true,
        }
      },
      // Include user info if the code is used
      user: { select: { id: true, name: true, phone: true } },
    },
    orderBy: {
      issuedAt: 'desc',
    },
  });
};

/**
 * Get all access codes for a specific user (for students and admins).
 * @param {number} userId
 * @returns {Promise<import('@prisma/client').AccessCode[]>}
 */
export const getAccessCodesByUserId = async (userId) => {
  return prisma.accessCode.findMany({
    where: { usedBy: userId },
    include: {
      courseLevel: {
        select: {
          id: true,
          name: true,
          courseId: true,
          course: {
            select: {
              id: true,
              title: true,
              specialization: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
      transaction: {
        include: {
          coupon: true,
        },
      },
    },
    orderBy: {
      issuedAt: 'desc',
    },
  });
};


/**
 * Get all access codes for a specific user (for students and admins).
 * @param {number} userId
 * @returns {Promise<import('@prisma/client').AccessCode[]>}
 */
export const getCourseLevelsByUserId = async (userId) => {
  return prisma.accessCode.findMany({
    where: {
      usedBy: userId,
      used: true,
      isActive: true,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      courseLevel: {
        select: {
          id: true,
          name: true,
          description: true,
          order: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
          course: { select: { id: true, title: true } },
          instructor: { select: { id: true, name: true, avatarUrl: true } }
        }
      }
    },
    orderBy: { usedAt: 'desc' }
  }).then(codes => codes.map(code => ({ ...code.courseLevel })));
};

export const updateAccessCodeWithTransaction = async ({
  id,
  courseLevelId,
  userId,
  validityInMonths,
  isActive,
  issuedBy,
  couponId,
  amountPaid,
  receiptImageUrl,
  notes
}) => {

  // 1️⃣ تحقق من وجود الكود أولاً
  const existingCode = await prisma.accessCode.findUnique({
    where: { id }
  });
  if (!existingCode) throw new Error('الكود غير موجود');

  // 2️⃣ تحديث كود الوصول
  const updatedAccessCode = await prisma.accessCode.update({
    where: { id },
    data: {
      courseLevelId: courseLevelId,
      usedBy: userId,
      validityInMonths: validityInMonths,
      issuedBy: issuedBy,
    }
  });

  // 3️⃣ البحث عن المعاملة المرتبطة بالكود
  const existingTransaction = await prisma.transaction.findFirst({
    where: { accessCodeId: id }
  });

  if (existingTransaction) {
    // تحديث المعاملة الموجودة
    await prisma.transaction.update({
      where: { id: existingTransaction.id },
      data: {
        receiptImageUrl: receiptImageUrl ?? existingTransaction.receiptImageUrl,
        amountPaid: amountPaid ? parseFloat(amountPaid) : undefined,
        notes: notes,
        couponId: couponId
      }
    });
  } else {
    // إنشاء معاملة جديدة
    const newTransaction = await prisma.transaction.create({
      data: {
        accessCodeId: id,
        receiptImageUrl: receiptImageUrl ?? '',
        amountPaid: amountPaid !== undefined ? parseFloat(amountPaid) : 0,
        notes: notes ?? '',
        couponId: couponId ?? null
      }
    });
  }

  return { ...updatedAccessCode, transaction: existingTransaction ?? newTransaction };
};




/**
 * Get all expired courses for a specific user (for students and admins).
 * @param {number} userId
 * @returns {Promise<import('@prisma/client').AccessCode[]>}
 */
export const toggleAccessCode = async (id, isActive, status) => {
  return prisma.accessCode.update({
    where: { id },
    data: {
      isActive,
      status
    },
    include: {
      courseLevel: {
        select: { id: true, name: true, courseId: true, course: { select: { id: true, title: true } } }
      }
    }
  });
};

export const deleteAccessCode = async (id) => {
  await prisma.transaction.deleteMany({ where: { accessCodeId: id } });
  return prisma.accessCode.delete({ where: { id } });
};

export const getExpiredCoursesByUserId = async (userId) => {
  const codes = await prisma.accessCode.findMany({
    where: {
      usedBy: userId,
      OR: [
        { isActive: false },
        { expiresAt: { lte: new Date() } }
      ]
    },
    include: {
      courseLevel: {
        select: { id: true }
      }
    },
    orderBy: { usedAt: 'desc' }
  });

  // استخراج جميع IDs فقط
  const levelIds = codes.map(code => code.courseLevel.id);

  return {
    count: levelIds.length,
    levelIds
  };
};

export const getActiveCodesStats = async () => {
  // 1️⃣ عدد الأكواد النشطة
  const activeCodesCount = await prisma.accessCode.count({
    where: {
      isActive: true,
      expiresAt: {
        gt: new Date()
      }
    },
  });

  // 2️⃣ جلب كل الأكواد النشطة لمعالجة المستخدمين حسب المستوى
  const activeCodes = await prisma.accessCode.findMany({
    where: {
      isActive: true,
      expiresAt: {
        gt: new Date()
      }
    },
    select: {
      courseLevelId: true,
      usedBy: true,
    },
  });

  // 3️⃣ تجميع عدد المستخدمين الفريدين لكل مستوى
  const groupedUsers = {};
  for (const code of activeCodes) {
    const levelId = code.courseLevelId;
    const userId = code.usedBy;
    if (!groupedUsers[levelId]) groupedUsers[levelId] = new Set();
    groupedUsers[levelId].add(userId);
  }

  // تحويل النتائج إلى مصفوفة
  const usersByLevel = Object.entries(groupedUsers).map(([levelId, users]) => ({
    courseLevelId: parseInt(levelId),
    totalUsersWithActiveCode: users.size,
  }));

  // 4️⃣ جلب أسماء المستويات (CourseLevel)
  const levels = await prisma.courseLevel.findMany({
    where: {
      id: { in: usersByLevel.map(l => l.courseLevelId) },
    },
    select: { id: true, name: true },
  });

  // دمج الأسماء مع النتائج
  const usersByLevelWithNames = usersByLevel.map(item => {
    const level = levels.find(l => l.id === item.courseLevelId);
    return {
      courseLevelId: item.courseLevelId,
      courseLevelName: level ? level.name : 'غير محدد',
      totalUsersWithActiveCode: item.totalUsersWithActiveCode,
    };
  });

  // 5️⃣ عدد كل المستخدمين الذين لديهم كود نشط (بغض النظر عن المستوى)
  const totalUsersWithAnyActiveCode = new Set(activeCodes.map(c => c.usedBy)).size;

  // ✅ النتيجة النهائية
  return {
    activeCodesCount, // 🔢 عدد الأكواد النشطة
    totalUsersWithAnyActiveCode, // 👥 عدد المشتركين الذين لديهم كود نشط
    usersByLevel: usersByLevelWithNames, // 🧍‍♂️ عدد المشتركين الذين لديهم كود نشط لكل مستوى
  };
};

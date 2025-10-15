import { customAlphabet } from 'nanoid';
import prisma from "../prisma/client.js";
import { sendCourseSubscriptionNotification } from './notification.service.js';

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
  courseLevelId, userId, validityInMonths, issuedBy, couponId, amountPaid, receiptImageUrl, notes }) => {
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
          course: true,
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
export const activateCode = async (code, userId, courseLevelId) => {
  const existingAccessCode = await prisma.accessCode.findFirst({
    where: {
      code,
      usedBy: userId,
      courseLevelId: courseLevelId
    }
  });

  // --- Validation Checks ---
  if (!existingAccessCode) {
    throw new Error('الكود غير صحيح أو لا ينتمي لهذا المستوى.');
  }

  if (!existingAccessCode.isActive || existingAccessCode.used) {
    throw new Error('هذا الكود تم استخدامه مسبقاً.');
  }

  // Calculate expiration date if validityInMonths is set
  let expiresAt = null;
  if (existingAccessCode.validityInMonths) {
    expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + existingAccessCode.validityInMonths);
  }

  // Update the access code in the database
  await prisma.accessCode.update({
    where: { id: existingAccessCode.id },
    data: {
      usedAt: new Date(),
      used: true,
      isActive: false, // Deactivate the code after use
      expiresAt,
    }
  });

  // Return the code with included relations
  const fullCode = await prisma.accessCode.findFirst({
    where: { code },
    include: {
      courseLevel: {
        include: {
          course: { select: { id: true, title: true } }
        }
      },
      user: {
        select: { id: true, name: true, phone: true }
      }
    }
  });

  // Send subscription notification
  try {
    await sendCourseSubscriptionNotification(fullCode.user, fullCode.courseLevel);
    console.log(`✅ تم إرسال إشعار الاشتراك للمستخدم: ${fullCode.user.name}`);
  } catch (error) {
    console.error(`❌ فشل إرسال إشعار الاشتراك: ${error.message}`);
  }

  return fullCode;
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
      courseLevel: { select: { id: true, name: true, courseId: true, course: { select: { id: true, title: true } } } },
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
      courseLevel: { select: { id: true, name: true, courseId: true, course: { select: { id: true, title: true } } } },
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
          instructor : { select: { id: true, name: true, avatarUrl: true } }
        }
      }
    },
    orderBy: { usedAt: 'desc' }
  }).then(codes => codes.map(code => ({ ...code.courseLevel })));
};

export const getExpiredCoursesByUserId = async (userId) => {
  const codes = await prisma.accessCode.findMany({
    where: {
      usedBy: userId,
      used: true,
      expiresAt: {
        lte: new Date()
      }
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


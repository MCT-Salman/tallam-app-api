import { customAlphabet } from 'nanoid';
import * as AccessCodeModel from '../models/accessCode.model.js';
import * as CourseModel from '../models/course.model.js';
import { COURSE_NOT_FOUND } from '../validators/messagesResponse.js';

// Define a custom alphabet for generating codes (uppercase letters and numbers, no ambiguous chars)
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 10);

/**
 * Generate unique access codes for a course.
 * @param {number} courseId
 * @param {number} count
 * @param {number | null} validityInMonths - How many months the code is valid for after activation.
 * @param {number} issuedBy - The ID of the admin who issued the codes.
 * @returns {Promise<string[]>} - Array of generated codes.
 */
export const generateAccessCodes = async (courseId, count, validityInMonths, issuedBy) => {
  const course = await CourseModel.findById(courseId);
  if (!course) throw new Error(COURSE_NOT_FOUND);

  const codesToCreate = Array.from({ length: count }, () => ({
    code: nanoid(),
    courseId,
    issuedBy,
    validityInMonths,
  }));

  await AccessCodeModel.createMany(codesToCreate);

  return codesToCreate.map(c => c.code);
};

/**
 * Activate an access code for a user.
 * @param {string} code - The access code string.
 * @param {number} userId - The ID of the user activating the code.
 * @returns {Promise<import('@prisma/client').AccessCode>}
 */
export const activateCode = async (code, userId) => {
  const accessCode = await AccessCodeModel.findByCode(code);

  // --- Validation Checks ---
  if (!accessCode) {
    throw new Error('الكود غير صحيح أو غير موجود.');
  }
  if (!accessCode.isActive || accessCode.usedBy) {
    throw new Error('هذا الكود تم استخدامه مسبقاً.');
  }

  // Calculate expiration date if validity is set
  let expiresAt = null;
  if (accessCode.validityInMonths) {
    expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + accessCode.validityInMonths);
  }

  // Update the access code in the database
  const updatedAccessCode = await AccessCodeModel.updateById(accessCode.id, {
    usedBy: userId,
    usedAt: new Date(),
    isActive: false, // Deactivate the code after use
    expiresAt,
  });

  return updatedAccessCode;
};

/**
 * Get all access codes for a specific course (for admins).
 * @param {number} courseId
 * @returns {Promise<import('@prisma/client').AccessCode[]>}
 */
export const getAccessCodesByCourse = async (courseId) => {
  return AccessCodeModel.findAll({
    where: { courseId },
    include: {
      course: { select: { id: true, title: true } },
      // Include user info if the code is used
      user: { select: { id: true, name: true, phone: true } },
    },
    orderBy: {
      issuedAt: 'desc',
    },
  });
};

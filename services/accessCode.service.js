import { customAlphabet } from 'nanoid';
import * as AccessCodeModel from '../models/accessCode.model.js';
import * as CourseModel from '../models/course.model.js';
import * as CourseLevelModel from '../models/courseLevel.model.js';
import { COURSE_NOT_FOUND } from '../validators/messagesResponse.js';

// Define a custom alphabet for generating codes (uppercase letters and numbers, no ambiguous chars)
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 10);

/**
 * Generate unique access codes for a course or a specific course level.
 * At least one of courseId or courseLevelId must be provided.
 * If courseLevelId is provided, it takes precedence and courseId is derived from the level.
 * @param {Object} params
 * @param {number | undefined} params.courseId
 * @param {number | undefined} params.courseLevelId
 * @param {number} params.count
 * @param {number | null} params.validityInMonths - How many months the code is valid for after activation.
 * @param {number} params.issuedBy - The ID of the admin who issued the codes.
 * @returns {Promise<string[]>} - Array of generated codes.
 */
export const generateAccessCodes = async ({ courseId, courseLevelId, count, validityInMonths, issuedBy }) => {
  let resolvedCourseId = courseId;

  // If courseLevelId provided, validate it and resolve courseId from it
  if (courseLevelId) {
    const level = await CourseLevelModel.findById(courseLevelId, { id: true, courseId: true });
    if (!level) throw new Error('المستوى غير موجود');
    // If both provided, ensure consistency
    if (resolvedCourseId && resolvedCourseId !== level.courseId) {
      throw new Error('المستوى لا ينتمي إلى الدورة المحددة');
    }
    resolvedCourseId = level.courseId;
  }

  if (!resolvedCourseId) {
    throw new Error(COURSE_NOT_FOUND);
  }

  const course = await CourseModel.findById(resolvedCourseId);
  if (!course) throw new Error(COURSE_NOT_FOUND);

  const codesToCreate = Array.from({ length: count }, () => {
    const base = {
      code: nanoid(),
      courseId: resolvedCourseId,
      issuedBy,
      validityInMonths,
    };
    if (courseLevelId) base.courseLevelId = courseLevelId;
    return base;
  });

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
  await AccessCodeModel.updateById(accessCode.id, {
    usedBy: userId,
    usedAt: new Date(),
    isActive: false, // Deactivate the code after use
    expiresAt,
  });

  // Return the code with included relations
  const fullCode = await AccessCodeModel.findByCode(code);
  return fullCode;
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
      courseLevel: { select: { id: true, name: true } },
      // Include user info if the code is used
      user: { select: { id: true, name: true, phone: true } },
    },
    orderBy: {
      issuedAt: 'desc',
    },
  });
};

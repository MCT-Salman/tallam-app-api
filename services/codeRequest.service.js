import prisma from '../prisma/client.js';
import { CodeRequestModel, CourseModel, UserModel } from '../models/index.js';
import { ALREADY_REQUESTED_CODE, COURSE_NOT_FOUND, USER_NOT_FOUND } from '../validators/messagesResponse.js';

/**
 * Create a new code request by a student.
 * @param {number} userId - The ID of the student.
 * @param {number} courseId - The ID of the course.
 * @param {string} [contact] - Optional contact info (e.g., WhatsApp/Telegram).
 * @returns {Promise<import('@prisma/client').CodeRequest>}
 */
export const createCodeRequest = async (userId, courseId, contact) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error(USER_NOT_FOUND);

  const course = await CourseModel.findById(courseId);
  if (!course) throw new Error(COURSE_NOT_FOUND);

  // Check if the user already has an active access code for this course
  const existingAccess = await prisma.accessCode.findFirst({
    where: {
      courseId,
      usedBy: userId,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
  if (existingAccess) {
    throw new Error('أنت تملك وصولاً فعالاً لهذه الدورة بالفعل.');
  }

  // Check if the user already has a pending request for this course
  const existingRequest = await CodeRequestModel.findFirst({
    where: {
      userId,
      courseId,
      status: 'PENDING',
    },
  });
  if (existingRequest) {
    throw new Error(ALREADY_REQUESTED_CODE);
  }

  return CodeRequestModel.create({
    userId,
    courseId,
    contact: contact || user.phone,
  });
};

/**
 * Get all code requests for a specific user.
 * @param {number} userId
 * @returns {Promise<import('@prisma/client').CodeRequest[]>}
 */
export const getUserCodeRequests = (userId) => {
  return CodeRequestModel.findAll({
    where: { userId },
    include: {
      course: { select: { id: true, title: true } },
    },
  });
};

/**
 * Get all code requests (for admins).
 * @param {object} filters - { status }
 * @param {number} skip
 * @param {number} take
 * @returns {Promise<{items: import('@prisma/client').CodeRequest[], total: number, skip: number, take: number}>}
 */
export const getAllCodeRequests = async (filters = {}, skip = 0, take = 20) => {
  const where = {};
  if (filters.status) {
    where.status = filters.status;
  }

  const [items, total] = await Promise.all([
    CodeRequestModel.findAll({ where, skip, take }),
    CodeRequestModel.count({ where }),
  ]);

  return { items, total, skip, take };
};

/**
 * Update the status of a code request (for admins).
 * @param {number} requestId
 * @param {'APPROVED' | 'REJECTED'} status
 * @returns {Promise<import('@prisma/client').CodeRequest>}
 */
export const updateCodeRequestStatus = async (requestId, status) => {
  const request = await CodeRequestModel.findById(requestId);
  if (!request) {
    throw new Error('الطلب غير موجود');
  }

  return CodeRequestModel.updateById(requestId, { status });
};

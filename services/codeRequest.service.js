import prisma from '../prisma/client.js';
import { ALREADY_REQUESTED_CODE, COURSE_NOT_FOUND, USER_NOT_FOUND } from '../validators/messagesResponse.js';

/**
 * Create a new code request by a student.
 */
export const createCodeRequest = async (userId, courseId, contact) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error(USER_NOT_FOUND);

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error(COURSE_NOT_FOUND);

  // Check if the user already has an active access code
  const existingAccess = await prisma.accessCode.findFirst({
    where: {
      courseLevel: { courseId },
      usedBy: userId,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
  if (existingAccess) {
    throw new Error('أنت تملك وصولاً فعالاً لهذه الدورة بالفعل.');
  }

  // Check if the user already has a pending request
  const existingRequest = await prisma.codeRequest.findFirst({
    where: { userId, courseId, status: 'PENDING' },
  });
  if (existingRequest) throw new Error(ALREADY_REQUESTED_CODE);

  // Create the request
  return prisma.codeRequest.create({
    data: {
      userId,
      courseId,
      contact: contact || user.phone,
    },
  });
};

/**
 * Get all code requests for a specific user.
 */
export const getUserCodeRequests = (userId) => {
  return prisma.codeRequest.findMany({
    where: { userId },
    include: {
      course: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get all code requests (for admins).
 */
export const getAllCodeRequests = async (filters = {}, skip = 0, take = 20) => {
  const where = {};
  if (filters.status) where.status = filters.status;

  const [items, total] = await Promise.all([
    prisma.codeRequest.findMany({
      where,
      skip,
      take,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.codeRequest.count({ where }),
  ]);

  return { items, total, skip, take };
};

/**
 * Update the status of a code request (for admins).
 */
export const updateCodeRequestStatus = async (requestId, status) => {
  const request = await prisma.codeRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new Error('الطلب غير موجود');

  return prisma.codeRequest.update({
    where: { id: requestId },
    data: { status },
  });
};

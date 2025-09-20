import { DomainModel, SpecializationModel, SubjectModel, InstructorModel, CourseModel } from "../models/index.js";
import prisma from "../prisma/client.js";

// Domains
export const createDomain = (name) => prisma.domain.create({ data: { name } });
export const listDomains = () => DomainModel.findAll({});
export const updateDomain = (id, data) => prisma.domain.update({ where: { id }, data });
export const toggleDomain = (id, isActive) => prisma.domain.update({ where: { id }, data: { isActive } });
export const DeleteDomain = (id) => prisma.domain.delete({ where: { id } });

// Specializations
// Specializations
export const createSpecialization = (data) =>
  prisma.specialization.create({ data });

export const listSpecializations = () =>
  prisma.specialization.findMany({
    orderBy: { name: "asc" },
    include: { domain: true }
  });
 
export const listSpecializationsByDomain = (domainId) =>
  prisma.specialization.findMany({
    where: { domainId },
    orderBy: { name: "asc" }
  });

export const updateSpecialization = (id, data) =>
  prisma.specialization.update({ where: { id }, data });

export const toggleSpecialization = (id, isActive) =>
  prisma.specialization.update({ where: { id }, data: { isActive } });

export const DeleteSpecialization = (id) => prisma.specialization.delete({ where: { id } });


// Subjects
export const createSubject = (name, specializationId) =>
  prisma.subject.create({ data: { name, specializationId } });

export const listSubjects = (specializationId) =>
  prisma.subject.findMany({
    where: specializationId ? { specializationId } : undefined,
    orderBy: { name: "asc" },
    include: { specialization: true }
  });

export const listSubjectsBySpecialization = (specializationId) =>
  prisma.subject.findMany({
    where: { specializationId },
    orderBy: { name: "asc" }
  });

export const updateSubject = (id, data) => prisma.subject.update({ where: { id }, data, include: { specialization: true } });
export const toggleSubject = (id, isActive) => prisma.subject.update({ where: { id }, data: { isActive }, include: { domain: true } });
export const DeleteSubject = (id) => prisma.subject.delete({ where: { id } });

// Instructors
export const createInstructor = (data) => prisma.instructor.create({ data });
export const listInstructors = () => InstructorModel.findAll({});
export const updateInstructor = (id, data) => prisma.instructor.update({ where: { id }, data });
export const toggleInstructor = (id, isActive) => prisma.instructor.update({ where: { id }, data: { isActive } });
export const DeleteInstructor = (id) => prisma.instructor.delete({ where: { id } });

/**
 * Create a new course and associate it with instructors.
 * @param {object} courseData - { title, description, subjectId, etc. }
 * @param {number[]} instructorIds - Array of instructor IDs.
 * @returns {Promise<Course>}
 */
export const createCourse = async (courseData, instructorIds) => {
  return prisma.$transaction(async (tx) => {
    const course = await tx.course.create({
      data: courseData,
    });

    if (instructorIds && instructorIds.length > 0) {
      await tx.courseInstructor.createMany({
        data: instructorIds.map((instructorId) => ({
          courseId: course.id,
          instructorId,
        })),
      });
    }

    // Return the full course object with instructors
    return tx.course.findUnique({
      where: { id: course.id },
      include: {
        subject: { include: { specialization: { include: { domain: true } } } },
        instructors: { include: { instructor: true } },
      },
    });
  });
};

/**
 * Update an existing course and its instructors.
 * @param {number} id - The ID of the course to update.
 * @param {object} courseData - The course data to update.
 * @param {number[]} [instructorIds] - Optional array of new instructor IDs.
 * @returns {Promise<Course>}
 */
export const updateCourse = async (id, courseData, instructorIds) => {
  return prisma.$transaction(async (tx) => {
    // Update course details
    const course = await tx.course.update({
      where: { id },
      data: courseData,
    });

    // If instructorIds are provided, update the associations
    if (instructorIds) {
      // Delete existing associations
      await tx.courseInstructor.deleteMany({
        where: { courseId: id },
      });
      // Create new associations
      if (instructorIds.length > 0) {
        await tx.courseInstructor.createMany({
          data: instructorIds.map((instructorId) => ({
            courseId: id,
            instructorId,
          })),
        });
      }
    }

    // Return the full course object with instructors
    return tx.course.findUnique({
      where: { id: course.id },
      include: {
        subject: { include: { specialization: { include: { domain: true } } } },
        instructors: { include: { instructor: true } },
      },
    });
  });
};

/**
 * Delete a course by its ID.
 * @param {number} id - The ID of the course to delete.
 * @returns {Promise<Course>}
 */
export const deleteCourse = async (id) => {
  return prisma.$transaction(async (tx) => {
    await tx.courseInstructor.deleteMany({ where: { courseId: id } });
    return tx.course.delete({ where: { id } });
  });
};


export const toggleCourse = (id, isActive) => prisma.course.update({ where: { id }, data: { isActive } });

/**
 * Get a single course by ID (for public guests).
 * @param {number} id - The ID of the course.
 * @returns {Promise<Course|null>}
 */
export const getCourseById = (id) => prisma.course.findUnique({
  where: { id },
  include: {
    subject: { include: { specialization: { include: { domain: true } } } },
    instructors: { include: { instructor: true } },
    levels: { where: { isActive: true }, orderBy: { order: 'asc' } },
    lessons: { where: { isFreePreview: true, isActive: true }, orderBy: { orderIndex: 'asc' } }
  }
});

/**
 * Get a single course by ID for an authenticated user (student or admin).
 * @param {number} id - The ID of the course.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Course|null>}
 */
export const getCourseByIdForUser = async (id, userId) => {
  // Check if user has access (owns an access code for this course)
  const hasAccess = await prisma.accessCode.findFirst({
    where: {
      courseId: id,
      usedBy: userId,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    }
  });

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      subject: { include: { specialization: { include: { domain: true } } } },
      instructors: { include: { instructor: true } },
      levels: { where: { isActive: true }, orderBy: { order: 'asc' } },
      // If user has access, show all active lessons, otherwise only free ones
      lessons: hasAccess ? { where: { isActive: true }, orderBy: { orderIndex: 'asc' } } : { where: { isFreePreview: true, isActive: true }, orderBy: { orderIndex: 'asc' } }
    }
  });

  if (!course) return null;

  return { ...course, hasAccess: !!hasAccess };
};

/**
 * List all courses for the public with filtering and pagination.
 * @param {object} filters - { q, domainId, subjectId, instructorId }
 * @param {number} skip
 * @param {number} take
 * @returns {Promise<{items: Course[], total: number, skip: number, take: number}>}
 */
export const listCoursesPublic = async (filters = {}, skip = 0, take = 20) => {
  const where = { isActive: true };
  const { q, domainId, subjectId, instructorId } = filters;

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { instructors: { some: { instructor: { name: { contains: q, mode: "insensitive" } } } } }
    ];
  }
  if (subjectId) where.subjectId = subjectId;
  if (instructorId) where.instructors = { some: { instructorId } };
  if (domainId) where.subject = { specialization: { domainId } };

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        subject: { select: { id: true, name: true } },
        instructors: { select: { instructor: { select: { id: true, name: true, avatarUrl: true } } } }
      }
    }),
    prisma.course.count({ where })
  ]);
  return { items, total, skip, take };
};

export const listInstructorsForCourse = (courseId) => prisma.courseInstructor.findMany({
  where: { courseId },
  include: { instructor: true }
});

/**
 * List all courses for the admin dashboard with filtering and pagination.
 * @param {object} filters - { q, subjectId, instructorId }
 * @param {number} skip
 * @param {number} take
 * @returns {Promise<{items: Course[], total: number, skip: number, take: number}>}
 */
export const listCoursesAdmin = async (filters = {}, skip = 0, take = 20) => {
  const where = {};
  const { q, subjectId, instructorId } = filters;

  if (q) where.title = { contains: q };
  if (subjectId) where.subjectId = subjectId;
  if (instructorId) where.instructors = { some: { instructorId } };

  const [items, total] = await Promise.all([
    prisma.course.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { subject: true, instructors: { include: { instructor: true } } } }),
    prisma.course.count({ where })
  ]);
  return { items, total, skip, take };
};

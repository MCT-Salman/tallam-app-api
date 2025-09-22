import { DomainModel, SpecializationModel, SubjectModel, InstructorModel, CourseModel } from "../models/index.js";
import prisma from "../prisma/client.js";

// Domains
export const createDomain = (name) => prisma.domain.create({ data: { name } });
export const listDomains = () => DomainModel.findAll({});
export const updateDomain = (id, data) => prisma.domain.update({ where: { id }, data });
export const toggleDomain = (id, isActive) => prisma.domain.update({ where: { id }, data: { isActive } });
export const DeleteDomain = (id) => prisma.domain.delete({ where: { id } });

// Specializations
export const createSpecialization = (data) => prisma.specialization.create({ data });

export const listSpecializations = () => prisma.specialization.findMany({
  orderBy: { name: "asc" },
  select: {
    id: true,
    name: true,
    imageUrl: true
  }
});

export const listSpecializationsBySubject = (subjectId) => prisma.specialization.findMany({
  where: { subjectId },
  orderBy: { name: "asc" },
  select: {
    id: true,
    name: true,
    imageUrl: true
  }
});

export const updateSpecialization = (id, data) => prisma.specialization.update({ where: { id }, data });

export const toggleSpecialization = (id, isActive) => prisma.specialization.update({ where: { id }, data: { isActive } });

export const DeleteSpecialization = (id) => prisma.specialization.delete({ where: { id } });


// Subjects
export const createSubject = (data) => prisma.subject.create({ data });

export const listSubjects = () => prisma.subject.findMany({
  orderBy: { name: "asc" },
  include: { domain: true }
});

export const listSubjectsByDomain = (domainId) => prisma.subject.findMany({
  where: { domainId },
  orderBy: { name: "asc" },
  include: { domain: true }
});

export const updateSubject = (id, data) => prisma.subject.update({ where: { id }, data });

export const toggleSubject = (id, isActive) => prisma.subject.update({ where: { id }, data: { isActive } });

export const DeleteSubject = (id) => prisma.subject.delete({ where: { id } });

// Instructors
export const createInstructor = (data) => prisma.instructor.create({ data });
export const listInstructors = () => prisma.instructor.findMany({include : {specialization : true}});
export const updateInstructor = (id, data) => prisma.instructor.update({ where: { id }, data });
export const toggleInstructor = (id, isActive) => prisma.instructor.update({ where: { id }, data: { isActive } });
export const DeleteInstructor = (id) => prisma.instructor.delete({ where: { id } });

/**
 * Create a new course and associate it with instructors.
 * @param {object} courseData - { title, description, subjectId, etc. }
 * @param {number[]} instructorIds - Array of instructor IDs.
 * @returns {Promise<Course>}
 */
export const createCourse = async (courseData) => {
  return prisma.$transaction(async (tx) => {
    const course = await tx.course.create({
      data: courseData,
    });

    // Return the full course object with instructors
    return tx.course.findUnique({
      where: { id: course.id },
      include: {
        specialization: true 
      },
    });
  });
};

/**
 * Update an existing course and its instructors.
 * @param {number} id - The ID of the course to update.
 * @param {object} courseData - The course data to update.
 * @returns {Promise<Course>}
 */
export const updateCourse = async (id, courseData) => {
  return prisma.$transaction(async (tx) => {
    // Update course details
    const course = await tx.course.update({
      where: { id },
      data: courseData,
    });


    // Return the full course object with instructors
    return tx.course.findUnique({
      where: { id: course.id },
      include: {
        specialization: { include: { subject: { include: { domain: true } } } }
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
    specialization: { include: { subject: { include: { domain: true } } } },
    levels: { where: { isActive: true }, orderBy: { order: 'asc' } }
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
      courseLevel: { courseId: id },
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
      specialization: { include: { subject: { include: { domain: true } } } },
      // Include levels with lessons; filter lessons depending on access
      levels: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          lessons: hasAccess
            ? { where: { isActive: true }, orderBy: { orderIndex: 'asc' } }
            : { where: { isFreePreview: true, isActive: true }, orderBy: { orderIndex: 'asc' } }
        }
      }
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
  const { q, specializationId } = filters;

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } }
    ];
  }
  if (specializationId) where.specializationId = specializationId;
  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true
      }
    }),
    prisma.course.count({ where })
  ]);
  return { items, total, skip, take };
};

/**
 * List all courses for the admin dashboard with filtering and pagination.
 * @param {object} filters - { q, subjectId, instructorId }
 * @param {number} skip
 * @param {number} take
 * @returns {Promise<{items: Course[], total: number, skip: number, take: number}>}
 */
export const listCoursesAdmin = async (filters = {}, skip = 0, take = 20) => {
  const where = {};
  const { q, specializationId, instructorId } = filters;

  if (q) where.title = { contains: q };
  if (specializationId) where.specializationId = specializationId;

  const [items, total] = await Promise.all([
    prisma.course.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { specialization:  true } }),
    prisma.course.count({ where })
  ]);
  return { items, total, skip, take };
};

/**
 * List instructors for a specific course by aggregating from its levels.
 * @param {number} courseId - The ID of the course.
 * @returns {Promise<Array>} - Array of instructor objects.
 */
export const listInstructorsForCourse = async (courseId) => {
  const levels = await prisma.courseLevel.findMany({
    where: { courseId, isActive: true },
    select: {
      instructor: {
        select: {
          id: true,
          name: true,
          bio: true,
          avatarUrl: true
        }
      }
    }
  });
  console.log(levels)

  const instructorsMap = new Map();
  levels.forEach(level => {
    if (level.instructor) {
      instructorsMap.set(level.instructor.id, level.instructor);
    }
  });

  return Array.from(instructorsMap.values());
};


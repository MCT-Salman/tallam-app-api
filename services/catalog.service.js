import { DomainModel, SubjectModel, InstructorModel, CourseModel } from "../models/index.js";
import prisma from "../prisma/client.js";

// Domains
export const createDomain = (name) => prisma.domain.create({ data: { name } });
export const listDomains = () => DomainModel.findAll({});
export const updateDomain = (id, data) => prisma.domain.update({ where: { id }, data });
export const toggleDomain = (id, isActive) => prisma.domain.update({ where: { id }, data: { isActive } });

// Subjects
export const createSubject = (name, domainId) => prisma.subject.create({ data: { name, domainId }, include: { domain: true } });
export const listSubjects = (domainId) => prisma.subject.findMany({ where: domainId ? { domainId } : {}, orderBy: { name: 'asc' }, include: { domain: true } });
export const updateSubject = (id, data) => prisma.subject.update({ where: { id }, data, include: { domain: true } });
export const toggleSubject = (id, isActive) => prisma.subject.update({ where: { id }, data: { isActive }, include: { domain: true } });

// Instructors
export const createInstructor = (data) => prisma.instructor.create({ data });
export const listInstructors = () => InstructorModel.findAll({});
export const updateInstructor = (id, data) => prisma.instructor.update({ where: { id }, data });
export const toggleInstructor = (id, isActive) => prisma.instructor.update({ where: { id }, data: { isActive } });

// Courses (Admin CRUD + Public list)
export const createCourse = (data) => prisma.course.create({ data, include: { subject: { include: { domain: true } }, instructor: true, levels: true, lessons: true } });
export const updateCourse = (id, data) => prisma.course.update({ where: { id }, data, include: { subject: { include: { domain: true } }, instructor: true, levels: true, lessons: true } });
export const toggleCourse = (id, isActive) => prisma.course.update({ where: { id }, data: { isActive }, include: { subject: { include: { domain: true } }, instructor: true, levels: true, lessons: true } });

export const getCourseById = (id) => prisma.course.findUnique({
  where: { id },
  include: { subject: { include: { domain: true } }, instructor: true, levels: true, lessons: true }
});

export const listCoursesPublic = async (filters = {}, skip = 0, take = 20) => {
  const where = { isActive: true };
  const { q, domainId, subjectId, instructorId } = filters;

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } }
    ];
  }
  if (subjectId) where.subjectId = subjectId;
  if (instructorId) where.instructorId = instructorId;
  if (domainId) where.subject = { domainId };

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { subject: { include: { domain: true } }, instructor: true, levels: true, lessons: true }
    }),
    CourseModel.count(where)
  ]);
  return { items, total, skip, take };
};

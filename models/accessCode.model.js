import prisma from '../prisma/client.js';

/**
 * Create a new access code.
 * @param {object} data - { code, courseId, issuedBy, expiresAt }
 * @returns {Promise<import('@prisma/client').AccessCode>}
 */
export const create = (data) => {
  return prisma.accessCode.create({ data });
};

/**
 * Create multiple access codes.
 * @param {object[]} data - Array of access code data.
 * @returns {Promise<{count: number}>}
 */
export const createMany = (data) => {
  return prisma.accessCode.createMany({ data, skipDuplicates: true });
};

/**
 * Find an access code by the code string.
 * @param {string} code
 * @returns {Promise<import('@prisma/client').AccessCode | null>}
 */
export const findByCode = (code) => {
  return prisma.accessCode.findUnique({
    where: { code },
    include: { course: true },
  });
};

/**
 * Update an access code by its ID.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<import('@prisma/client').AccessCode>}
 */
export const updateById = (id, data) => {
  return prisma.accessCode.update({ where: { id }, data });
};

/**
 * Find all access codes with optional filtering.
 * @param {object} args - Prisma findMany args.
 * @returns {Promise<import('@prisma/client').AccessCode[]>}
 */
export const findAll = (args) => {
  return prisma.accessCode.findMany(args);
};




import { UserModel } from '../models/index.js';
import { hashPassword } from '../utils/hash.js';
import { getCountryFromPhone } from '../utils/phoneCountry.js';
import { NUMBER_ALREADY_EXIST } from '../validators/messagesResponse.js';

/**
 * Get all users with filtering and pagination (for admins)
 * @param {object} filters - { q, role, country, isActive }
 * @param {number} skip
 * @param {number} take
 * @returns {Promise<{items: User[], total: number, skip: number, take: number}>}
 */
export const getAllUsers = async (filters = {}, skip = 0, take = 20) => {
  const where = {};
  const { q, role, country, isActive } = filters;

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
    ];
  }
  if (role) where.role = role;
  if (country) where.country = { contains: country };
  if (isActive !== undefined) where.isActive = isActive;

  // Exclude password hash from the result
  const select = {
    id: true,
    name: true,
    phone: true,
    role: true,
    country: true,
    isActive: true,
    isVerified: true,
    createdAt: true,
  };

  const [items, total] = await Promise.all([
    UserModel.findAll({ where, skip, take, select }),
    UserModel.count(where),
  ]);

  return { items, total, skip, take };
};

/**
 * Get a single user by ID (for admins)
 * @param {number} id
 * @returns {Promise<User|null>}
 */
export const getUserById = async (id) => {
  // Using a select clause to explicitly exclude the password hash
  return UserModel.findById(id, {
    id: true, name: true, phone: true, birthDate: true, avatarUrl: true,
    role: true, sex: true, country: true, countryCode: true,
    isVerified: true, isActive: true, createdAt: true, updatedAt: true,
  });
};

/**
 * Create a new user (by admin)
 * @param {object} userData - { phone, password, name, birthDate, sex, role, isActive }
 * @returns {Promise<User>}
 */
export const createUserByAdmin = async (userData) => {
  const { phone, password, name, birthDate, sex, role, isActive } = userData;

  const exists = await UserModel.findByPhone(phone);
  if (exists) throw new Error(NUMBER_ALREADY_EXIST);

  const passwordHash = await hashPassword(password);
  const phoneInfo = getCountryFromPhone(phone);

  const user = await UserModel.createUser({
    phone: phoneInfo.success ? phoneInfo.phone : phone,
    passwordHash,
    name,
    birthDate: new Date(birthDate),
    sex,
    role: role || 'STUDENT',
    isActive: isActive !== undefined ? isActive : true,
    isVerified: true, // Admin-created users are verified by default
    country: phoneInfo.success ? phoneInfo.countryName : null,
    countryCode: phoneInfo.success ? phoneInfo.countryCode : null,
  });

  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
};

/**
 * Update a user (by admin)
 * @param {number} id
 * @param {object} updateData
 * @returns {Promise<User>}
 */
export const updateUserByAdmin = async (id, updateData) => {
  const { phone, password, ...restData } = updateData;
  const dataToUpdate = { ...restData };

  if (phone) {
    const exists = await UserModel.findByPhone(phone);
    if (exists && exists.id !== id) {
      throw new Error(NUMBER_ALREADY_EXIST);
    }
    const phoneInfo = getCountryFromPhone(phone);
    dataToUpdate.phone = phoneInfo.success ? phoneInfo.phone : phone;
    dataToUpdate.country = phoneInfo.success ? phoneInfo.countryName : null;
    dataToUpdate.countryCode = phoneInfo.success ? phoneInfo.countryCode : null;
  }

  if (password) {
    dataToUpdate.passwordHash = await hashPassword(password);
  }

  if (updateData.birthDate) {
    dataToUpdate.birthDate = new Date(updateData.birthDate);
  }

  const user = await UserModel.updateById(id, dataToUpdate);
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
};

/**
 * Delete a user by ID (for admins)
 * @param {number} id
 * @returns {Promise<User>}
 */
export const deleteUserById = async (id) => {
  // Prisma will handle cascading deletes based on schema relations.
  return UserModel.deleteById(id);
};

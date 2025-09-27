import { UserModel } from '../models/index.js';
import { getCountryFromPhone } from '../utils/phoneCountry.js';
import { INSUFFICIENT_PERMISSIONS, NUMBER_ALREADY_EXIST } from '../validators/messagesResponse.js';

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
    birthDate: true,
    avatarUrl: true,
    sex: true,
    role: true,
    country: true,
    isActive: true,
    isVerified: true,
    expiresAt: true,
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
    role: true, sex: true, country: true, countryCode: true, expiresAt: true,
    isVerified: true, isActive: true, createdAt: true, updatedAt: true,
  });
};

/**
 * Create a new user (by admin)
 * @param {object} userData - { phone, password, name, birthDate, sex, role, isActive }
 * @param {object} actor - The admin performing the action
 * @returns {Promise<User>}
 */
export const createUserByAdmin = async (userData, actor) => {
  const { phone, name, birthDate, sex, role, isActive, expiresAt } = userData;

  // Security check: Only ADMIN can create other ADMINs or SUBADMINs.
  const targetRole = role || 'STUDENT';
  if (actor.role === 'SUBADMIN' && (targetRole === 'ADMIN' || targetRole === 'SUBADMIN')) {
    throw new Error(INSUFFICIENT_PERMISSIONS);
  }

  const exists = await UserModel.findByPhone(phone);
  if (exists) throw new Error(NUMBER_ALREADY_EXIST);

  const phoneInfo = getCountryFromPhone(phone);

  const user = await UserModel.createUser({
    phone: phoneInfo.success ? phoneInfo.phone : phone,
    name,
    birthDate: new Date(birthDate),
    sex,
    role: targetRole,
    isActive: isActive !== undefined ? isActive : true,
    isVerified: true, // Admin-created users are verified by default
    country: phoneInfo.success ? phoneInfo.countryName : null,
    countryCode: phoneInfo.success ? phoneInfo.countryCode : null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  });

  const { ...safeUser } = user;
  return safeUser;
};

/**
 * Update a user (by admin)
 * @param {number} id
 * @param {object} updateData
 * @param {object} actor - The admin performing the action
 * @returns {Promise<User>}
 */
export const updateUserByAdmin = async (id, updateData, actor) => {
  const { phone, ...restData } = updateData;
  const dataToUpdate = { ...restData };

  // Security check: SUBADMIN can only edit STUDENTS.
  const targetUser = await UserModel.findById(id);
  if (actor.role === 'SUBADMIN') {
    if (!targetUser) throw new Error('المستخدم المستهدف غير موجود');

    // SUBADMIN cannot change roles, and can only edit students.
    if (updateData.role || targetUser.role !== 'STUDENT') {
      throw new Error(INSUFFICIENT_PERMISSIONS);
    }
    // SUBADMIN cannot set expiration. We explicitly remove the property if it exists.
    if (updateData.hasOwnProperty('expiresAt')) {
      delete dataToUpdate.expiresAt;
    }
  }

  if (!targetUser) throw new Error('المستخدم المستهدف غير موجود');


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

  if (updateData.birthDate) {
    dataToUpdate.birthDate = new Date(updateData.birthDate);
  }

  // Handle expiresAt - allow setting it to null
  if (actor.role === 'ADMIN' && updateData.hasOwnProperty('expiresAt')) {
    dataToUpdate.expiresAt = updateData.expiresAt ? new Date(updateData.expiresAt) : null;
  }

  const user = await UserModel.updateById(id, dataToUpdate);
  const { ...safeUser } = user;
  return safeUser;
};


/**
 * Delete a user by ID (for admins)
 * @param {number} id
 * @param {object} actor - The admin performing the action
 * @returns {Promise<User>}
 */
export const deleteUserById = async (id, actor) => {
  // Security check: SUBADMIN can only delete STUDENTS.
  if (actor.role === 'SUBADMIN') {
    const targetUser = await UserModel.findById(id);
    if (!targetUser || targetUser.role !== 'STUDENT') {
      throw new Error(INSUFFICIENT_PERMISSIONS);
    }
  }
  // Prisma will handle cascading deletes based on schema relations.
  return UserModel.deleteById(id);
};


/**
 * Toggle user active status (by admin)
 * @param {number} id - User ID
 * @param {object} actor - The admin performing the action
 * @returns {Promise<User>}
 */
export const toggleUserActiveStatus = async (id, actor) => {
  const targetUser = await UserModel.findById(id);

  if (!targetUser) {
    throw new Error("المستخدم المستهدف غير موجود");
  }

  // SUBADMIN لا يمكنه التحكم إلا بالطلاب
  if (actor.role === "SUBADMIN" && targetUser.role !== "STUDENT") {
    throw new Error("ليست لديك صلاحية لتغيير حالة هذا الحساب");
  }

  const updatedUser = await UserModel.updateById(id, {
    isActive: !targetUser.isActive,
  });

  const { ...safeUser } = updatedUser;
  return safeUser;
};

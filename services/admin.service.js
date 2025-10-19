import prisma from "../prisma/client.js";
import { UserModel, SessionModel } from "../models/index.js";
import { comparePassword } from "../utils/hash.js";
import { generateTokenPair, revokeUserRefreshTokensExceptSession } from "../utils/jwt.js";
import { getRealIP } from "../utils/ip.js";
import { hashPassword } from '../utils/hash.js';
import { getCountryFromPhone } from "../utils/phoneCountry.js";
export const createAdmin = async (phone, name, sex, birthDate, country, countryCode, role, expiresAt, username, email, password, isActive) => {
  const existingUser = await UserModel.findByPhone(phone);
  if (existingUser) throw new Error("رقم الهاتف موجود مسبقًا");

  const existingEmail = await prisma.admin.findUnique({ where: { email } });
  if (existingEmail) throw new Error("البريد الإلكتروني مستخدم مسبقًا");

  const passwordHash = await hashPassword(password);

  const phoneInfo = getCountryFromPhone(phone);
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        phone: phoneInfo.success ? phoneInfo.phone : phone,
        name,
        sex,
        birthDate: new Date(birthDate),
        role,
        isVerified: true,
        country: phoneInfo.success ? phoneInfo.countryName : null,
        countryCode: phoneInfo.success ? phoneInfo.countryCode : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? isActive : true
      },
    });

    const admin = await tx.admin.create({
      data: {
        userId: user.id,
        username,
        email,
        passwordHash,
      },
    });

    return { user, admin };
  });

  const { passwordHash: _, ...safeUser } = result.user;
  const safeAdmin = {
    id: result.admin.id,
    username: result.admin.username,
    email: result.admin.email,
  };

  // 🔹 إرجاع البيانات
  return {
    user: safeUser,
    admin: safeAdmin,
  };
};
export const setUserRole = async (userId, role) => {
  const validRoles = ["STUDENT", "ADMIN", "SUBADMIN"];
  if (!validRoles.includes(role)) throw new Error("هذا الدور غير فعال");

  return UserModel.updateById(
    userId,
    { role },
    {
      id: true,
      phone: true,
      name: true,
      role: true,
      isActive: true
    }
  );
};

export const toggleUserActive = async (userId, isActive) => {
  return UserModel.updateById(
    userId,
    { isActive },
    {
      id: true,
      phone: true,
      name: true,
      role: true,
      isActive: true
    }
  );
};

/**
 * Admin login with email or username + password
 */
export const adminLogin = async (identifier, password, req) => {
  // Find admin by email or username
  const admin = await prisma.admin.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier }
      ]
    },
    include: {
      user: true
    }
  });

  if (!admin) {
    throw new Error("بيانات تسجيل الدخول غير صحيحة");
  }

  if (!admin.passwordHash) {
    throw new Error("الحساب الإداري لا يملك كلمة مرور بعد. يرجى تعيين كلمة مرور.");
  }

  // Check password
  const ok = await comparePassword(password, admin.passwordHash);
  if (!ok) {
    throw new Error("بيانات تسجيل الدخول غير صحيحة");
  }

  // Validate user state and role
  const user = admin.user;
  if (!user || !user.isActive || !user.isVerified) {
    throw new Error("لا يمكن تسجيل الدخول لهذا الحساب");
  }
  if (!['ADMIN', 'SUBADMIN'].includes(user.role)) {
    throw new Error("صلاحيات غير كافية");
  }

  // Create session
  const realIp = getRealIP(req);
  const userAgent = req.headers["user-agent"];
  const session = await SessionModel.createSession({
    userId: user.id,
    userAgent,
    ip: req.ip,
    realIp
  });

  await UserModel.updateById(user.id, { currentSessionId: session.id });

  // Generate tokens
  const tokens = await generateTokenPair(user.id, session.id, user.role);
  await revokeUserRefreshTokensExceptSession(user.id, session.id);

  const { isVerified: __, ...safeUser } = user;
  return {
    user: safeUser,
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email
    },
    ...tokens
  };
};

/**
 * Get all admins with pagination
 */
export const getAllAdmins = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [admins, total] = await Promise.all([
    prisma.admin.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            sex: true,
            birthDate: true,
            country: true,
            countryCode: true,
            expiresAt: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    }),
    prisma.admin.count()
  ]);

  return {
    admins: admins.map(admin => ({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      user: admin.user
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get admin by ID
 */
export const getAdminById = async (adminId) => {
  const admin = await prisma.admin.findUnique({
    where: { id: parseInt(adminId) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  if (!admin) {
    throw new Error("المشرف غير موجود");
  }

  return {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    user: admin.user
  };
};

/**
 * Update admin information
 */
export const updateAdmin = async (adminId, updateData) => {
  const {
    phone, name, sex, birthDate, role,
    expiresAt, username, email, password, isActive
  } = updateData;

  const admin = await prisma.admin.findUnique({
    where: { id: parseInt(adminId) },
    include: { user: true }
  });

  if (!admin) throw new Error("المشرف غير موجود");

  if (email && email !== admin.email) {
    const existingEmail = await prisma.admin.findUnique({ where: { email } });
    if (existingEmail) throw new Error("البريد الإلكتروني مستخدم مسبقاً");
  }

  if (username && username !== admin.username) {
    const existingUsername = await prisma.admin.findUnique({ where: { username } });
    if (existingUsername) throw new Error("اسم المستخدم مستخدم مسبقاً");
  }

  if (phone && phone !== admin.user.phone) {
    const existingPhone = await UserModel.findByPhone(phone);
    if (existingPhone) throw new Error("رقم الهاتف مستخدم مسبقاً");
  }

  const result = await prisma.$transaction(async (tx) => {
    const adminUpdateData = {};
    if (username) adminUpdateData.username = username;
    if (email) adminUpdateData.email = email;
    if (password) adminUpdateData.passwordHash = await hashPassword(password);

    const updatedAdmin = Object.keys(adminUpdateData).length
      ? await tx.admin.update({ where: { id: parseInt(adminId) }, data: adminUpdateData })
      : admin;

    const userUpdateData = {};
    if (name) userUpdateData.name = name;
    if (birthDate) userUpdateData.birthDate = new Date(birthDate);
    if (sex) userUpdateData.sex = sex;
    if (phone) {
      const phoneInfo = getCountryFromPhone(phone);
      userUpdateData.phone = phoneInfo.success ? phoneInfo.phone : phone;
      userUpdateData.country = phoneInfo.success ? phoneInfo.countryName : null;
      userUpdateData.countryCode = phoneInfo.success ? phoneInfo.countryCode : null;
    }
    if (role) userUpdateData.role = role;
    if (isActive !== undefined)
      userUpdateData.isActive = (isActive === true || isActive === 'true');
    if (expiresAt) userUpdateData.expiresAt = new Date(expiresAt);

    const updatedUser = Object.keys(userUpdateData).length
      ? await tx.user.update({ where: { id: admin.userId }, data: userUpdateData })
      : admin.user;

    return { admin: updatedAdmin, user: updatedUser };
  });

  return {
    id: result.admin.id,
    username: result.admin.username,
    email: result.admin.email,
    user: {
      id: result.user.id,
      name: result.user.name,
      phone: result.user.phone,
      role: result.user.role,
      sex: result.user.sex,
      birthDate: result.user.birthDate,
      country: result.user.country,
      countryCode: result.user.countryCode,
      expiresAt: result.user.expiresAt,
      isVerified: result.user.isVerified,
      createdAt: result.user.createdAt,
      updatedAt: result.user.updatedAt,
      isActive: result.user.isActive
    }
  };
};


/**
 * Delete admin ( delete user)
 */
export const deleteAdmin = async (adminId) => {
  const admin = await prisma.admin.findUnique({
    where: { id: parseInt(adminId) },
    include: { user: true }
  });

  if (!admin) {
    throw new Error("المشرف غير موجود");
  }

  await prisma.$transaction(async (tx) => {
    // Delete admin record first
    await tx.admin.delete({
      where: { id: parseInt(adminId) }
    });

    // Delete user record
    await tx.user.delete({
      where: { id: admin.userId }
    });
  });

  return {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    message: "تم حذف المشرف بنجاح"
  };
};



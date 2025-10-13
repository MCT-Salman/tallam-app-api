import prisma from "../prisma/client.js";
import { UserModel, SessionModel } from "../models/index.js";
import { comparePassword } from "../utils/hash.js";
import { generateTokenPair, revokeUserRefreshTokensExceptSession } from "../utils/jwt.js";
import { getRealIP } from "../utils/ip.js";
import { hashPassword } from '../utils/hash.js';
import { getCountryFromPhone } from "../utils/phoneCountry.js";
/*
export const createSubAdmin = async (phone, name, sex, birthDate, country, countryCode, role, username, email, password) => {
  const exists = await UserModel.findByPhone(phone);
  if (exists) throw new Error("رقم الهاتف موجود مسبقا");

  const user = await UserModel.createUser({
    phone,
    name,
    sex,
    birthDate: new Date(birthDate),
    country,
    countryCode,
    role,
    isVerified: true
  });

  // تشفير كلمة المرور
  const passwordHash = await hashPassword(password);

  // إنشاء سجل الأدمن
  const admin = await prisma.admin.create({
    data: {
      userId: user.id,
      username,
      email,
      passwordHash
    }
  });
  const {...safeUser } = user;
  return safeUser;
};*/
export const createAdmin = async (phone, name, sex, birthDate, country, countryCode, role, expiresAt, username, email, password) => {
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

import prisma from "../prisma/client.js";
import { UserModel, SessionModel } from "../models/index.js";
import { comparePassword } from "../utils/hash.js";
import { generateTokenPair, revokeUserRefreshTokensExceptSession } from "../utils/jwt.js";
import { getRealIP } from "../utils/ip.js";

export const createSubAdmin = async (phone, name, birthDate) => {
  const exists = await UserModel.findByPhone(phone);
  if (exists) throw new Error("رقم الهاتف موجود مسبقا");

  const user = await UserModel.createUser({
    phone,
    name,
    birthDate: new Date(birthDate),
    role: "SUBADMIN",
    isVerified: true
  });

  const {...safeUser } = user;
  return safeUser;
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

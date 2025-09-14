import { hashPassword } from "../utils/hash.js";
import { UserModel } from "../models/index.js";

export const createSubAdmin = async (phone, password, name, birthDate) => {
  const exists = await UserModel.findByPhone(phone);
  if (exists) throw new Error("رقم الهاتف موجود مسبقا");

  const passwordHash = await hashPassword(password);
  const user = await UserModel.createUser({
    phone,
    passwordHash,
    name,
    birthDate: new Date(birthDate),
    role: "SUBADMIN",
    isVerified: true
  });

  const { passwordHash: _, ...safeUser } = user;
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

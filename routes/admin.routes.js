import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { addAdmin, changeRole, deactivateUser, adminLogin } from "../controllers/admin.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { adminLoginRules , addAdminRules } from "../validators/admin.validators.js";

const r = Router();

// مسار عام لتسجيل الدخول للوحة التحكم
r.post("/login", validate(adminLoginRules), adminLogin);

// كل المسارات هنا للمدير الرئيسي فقط
r.post("/create-admin", requireAuth, requireRole(["ADMIN"]),validate(addAdminRules), addAdmin);
r.put("/set-role", requireAuth, requireRole(["ADMIN"]), changeRole);
r.put("/toggle-active", requireAuth, requireRole(["ADMIN"]), deactivateUser);

export default r;

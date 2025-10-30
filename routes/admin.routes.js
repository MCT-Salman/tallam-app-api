import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  addAdmin,
  changeRole,
  deactivateUser,
  adminLogin,
  listAdmins,
  getAdmin,
  editAdmin,
  removeAdmin,
  deleteSession,
  deleteAllSessions
} from "../controllers/admin.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  adminLoginRules,
  addAdminRules,
  updateAdminRules,
  adminIdParam,
  listAdminsQuery
} from "../validators/admin.validators.js";

const router = Router();

// مسار عام لتسجيل الدخول للوحة التحكم
router.post("/login", validate(adminLoginRules), adminLogin);

// كل المسارات هنا للمدير الرئيسي فقط
router.post("/create-admin", requireAuth, requireRole(["ADMIN"]), validate(addAdminRules), addAdmin);
router.put("/set-role", requireAuth, requireRole(["ADMIN"]), changeRole);
router.put("/toggle-active", requireAuth, requireRole(["ADMIN"]), deactivateUser);

router.delete("/all-sessions", requireAuth, requireRole(["ADMIN"]), deleteAllSessions);
router.delete("/delete-session", requireAuth, requireRole(["ADMIN"]), deleteSession);

router.get("/list", requireAuth, requireRole(["ADMIN"]), validate(listAdminsQuery), listAdmins);
router.get("/:id", requireAuth, requireRole(["ADMIN"]), validate(adminIdParam), getAdmin);
router.put("/:id", requireAuth, requireRole(["ADMIN"]), validate(updateAdminRules), editAdmin);
router.delete("/:id", requireAuth, requireRole(["ADMIN"]), validate(adminIdParam), removeAdmin);

export default router;

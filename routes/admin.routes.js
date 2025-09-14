import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { addSubAdmin, changeRole, deactivateUser } from "../controllers/admin.controller.js";

const r = Router();

// كل المسارات هنا للمدير الرئيسي فقط
r.post("/create-subadmin", requireAuth, requireRole(["ADMIN"]), addSubAdmin);
r.put("/set-role", requireAuth, requireRole(["ADMIN"]), changeRole);
r.put("/toggle-active", requireAuth, requireRole(["ADMIN"]), deactivateUser);

export default r;

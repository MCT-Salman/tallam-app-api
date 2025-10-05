import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import {
  adminGetSettings,
  adminGetSetting,
  adminCreateSetting,
  adminUpdateSetting,
  adminUpdateSettings,
  adminDeleteSetting
} from "../controllers/appSettings.controller.js";

const router = Router();

// Admin routes for managing settings
router.use(requireAuth);
router.use(requireRole(['ADMIN', 'SUBADMIN']));

router.get("/", adminGetSettings);
router.get("/:key", adminGetSetting);
router.post("/", adminCreateSetting);
router.put("/:key", adminUpdateSetting);
router.put("/", adminUpdateSettings); // For bulk updates
router.delete("/:key", adminDeleteSetting);

export default router;

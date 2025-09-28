import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { uploadAnyFile } from "../middlewares/upload.middleware.js";
import { idParam, fileCreateRules, fileUpdateRules, listQueryRules } from "../validators/file.validators.js";
import { adminListFiles, adminCreateFile, adminGetFile, adminUpdateFile, adminDeleteFile, publicListFiles, publicGetFile } from "../controllers/file.controller.js";

const r = Router();

// Admin endpoints
r.get("/admin/files", requireAuth, requireRole(["ADMIN", "SUBADMIN"]), validate(listQueryRules), adminListFiles);
r.post("/admin/files", requireAuth, requireRole(["ADMIN", "SUBADMIN"]), uploadAnyFile.single('file'), validate(fileCreateRules), adminCreateFile);
r.get("/admin/files/:id", requireAuth, requireRole(["ADMIN", "SUBADMIN"]), validate(idParam), adminGetFile);
r.put("/admin/files/:id", requireAuth, requireRole(["ADMIN", "SUBADMIN"]), uploadAnyFile.single('file'), validate(idParam), validate(fileUpdateRules), adminUpdateFile);
r.delete("/admin/files/:id", requireAuth, requireRole(["ADMIN", "SUBADMIN"]), validate(idParam), adminDeleteFile);

// Public endpoints (read-only)
r.get("/files", validate(listQueryRules), publicListFiles);
r.get("/files/:id", validate(idParam), publicGetFile);

export default r;

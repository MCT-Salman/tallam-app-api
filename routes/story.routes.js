import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { idParam, storyCreateRules, storyUpdateRules, listQueryRules } from "../validators/story.validators.js";
import { adminListStories, adminCreateStory, adminGetStory, adminUpdateStory, adminDeleteStory, publicListActiveStories, publicGetStory } from "../controllers/story.controller.js";
import { uploadStoryImage } from "../middlewares/upload.middleware.js";
const r = Router();

// Admin endpoints
r.get("/admin/stories", requireAuth, requireRole(["ADMIN", "SUBADMIN"]), validate(listQueryRules), adminListStories);
r.post("/admin/stories", requireAuth, requireRole(["ADMIN", "SUBADMIN"]), uploadStoryImage.single('imageUrl'), validate(storyCreateRules), adminCreateStory);
r.get("/admin/stories/:id", requireAuth, requireRole(["ADMIN", "SUBADMIN"]), validate(idParam), adminGetStory);
r.put("/admin/stories/:id", requireAuth, requireRole(["ADMIN", "SUBADMIN"]), uploadStoryImage.single('imageUrl'), validate(idParam), validate(storyUpdateRules), adminUpdateStory);
r.delete("/admin/stories/:id", requireAuth, requireRole(["ADMIN", "SUBADMIN"]), validate(idParam), adminDeleteStory);

// Public endpoints (read-only)
r.get("/stories", publicListActiveStories);
r.get("/stories/:id", publicGetStory);

export default r;

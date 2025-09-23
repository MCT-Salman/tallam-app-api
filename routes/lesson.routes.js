import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth , optionalAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { levelCreateRules, lessonCreateRules, toggleActiveRules, courseLevelIdParam, idParam, instructorIdParam } from "../validators/lesson.validators.js";
import { courseIdParam } from "../validators/catalog.validators.js";
import {
  adminCreateLevel, adminListLevels, adminUpdateLevel, adminToggleLevel, adminDeleteLevel,
  adminListLessonsByLevel, adminCreateLessonForLevel, adminUpdateLesson, adminToggleLesson, adminDeleteLesson,
  publicListLevelsWithLessons, publicListLevelsByCourseAndInstructor,publicDetailLevel, publicListLessonsByLevel
} from "../controllers/lesson.controller.js";

 
const r = Router();

// Admin - Levels
r.get("/admin/courses/:courseId/levels", requireAuth, requireRole(["ADMIN"]), validate(courseIdParam), adminListLevels);
r.post("/admin/courses/:courseId/levels", requireAuth, requireRole(["ADMIN"]), validate(courseIdParam), validate(levelCreateRules), adminCreateLevel);
r.put("/admin/levels/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(levelCreateRules), adminUpdateLevel);
r.put("/admin/levels/:id/active", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(toggleActiveRules), adminToggleLevel);
r.delete("/admin/levels/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), adminDeleteLevel);

// Admin - Lessons
r.get("/admin/levels/:courseLevelId/lessons", requireAuth, requireRole(["ADMIN"]), validate(courseLevelIdParam), adminListLessonsByLevel);
r.post("/admin/levels/:courseLevelId/lessons", requireAuth, requireRole(["ADMIN"]), validate(courseLevelIdParam), validate(lessonCreateRules), adminCreateLessonForLevel);
r.put("/admin/lessons/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(lessonCreateRules), adminUpdateLesson);
r.put("/admin/lessons/:id/active", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(toggleActiveRules), adminToggleLesson);
r.delete("/admin/lessons/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), adminDeleteLesson);

// Public
r.get("/courses/:courseId/levels", validate(courseIdParam), publicListLevelsWithLessons);
r.get("/courses/:courseId/instructors/:instructorId/levels", validate(courseIdParam), validate(instructorIdParam), publicListLevelsByCourseAndInstructor);
r.get("/levels/:courseLevelId", optionalAuth ,validate(courseLevelIdParam), publicDetailLevel);
r.get("/levels/:courseLevelId/lessons", validate(courseLevelIdParam), publicListLessonsByLevel);

export default r;

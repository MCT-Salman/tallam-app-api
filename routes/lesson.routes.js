import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth , optionalAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { levelCreateRules, levelUpdateRules, lessonCreateRules, lessonUpdateRules, toggleActiveRules, courseLevelIdParam, idParam, instructorIdParam, codeParam } from "../validators/lesson.validators.js";
import { courseIdParam } from "../validators/catalog.validators.js";
import {
  adminListCodeLevels,adminDetailLevel, adminCreateLevel, adminListLevels, adminUpdateLevel, adminToggleLevel, adminDeleteLevel,
  adminListLessonsByLevel, adminCreateLessonForLevel, adminUpdateLesson, adminToggleLesson, adminDeleteLesson,
  publicListLevelsWithLessons, publicListLevelsByCourseAndInstructor,publicDetailLevel, publicListLessonsByLevel
} from "../controllers/lesson.controller.js";
import { uploadCourseLevelImage } from "../middlewares/upload.middleware.js";
 
const r = Router();

// Admin - Levels
r.get("/admin/codelevels", requireAuth, requireRole(["ADMIN"]), adminListCodeLevels);
r.get("/admin/CodeLevel/:encode", requireAuth, requireRole(["ADMIN"]), validate(codeParam), adminDetailLevel);
r.get("/admin/courses/:courseId/levels", requireAuth, requireRole(["ADMIN"]), validate(courseIdParam), adminListLevels);
r.post("/admin/courses/:courseId/levels", requireAuth, requireRole(["ADMIN"]), validate(courseIdParam),uploadCourseLevelImage.single('imageUrl'), validate(levelCreateRules), adminCreateLevel);
r.put("/admin/levels/:id", requireAuth, requireRole(["ADMIN"]), uploadCourseLevelImage.single('imageUrl'), validate(levelUpdateRules), adminUpdateLevel);
r.put("/admin/levels/:id/active", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(toggleActiveRules), adminToggleLevel);
r.delete("/admin/levels/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), adminDeleteLevel);

// Admin - Lessons
r.get("/admin/levels/:courseLevelId/lessons", requireAuth, requireRole(["ADMIN"]), validate(courseLevelIdParam), adminListLessonsByLevel);
r.post("/admin/levels/:courseLevelId/lessons", requireAuth, requireRole(["ADMIN"]), validate(courseLevelIdParam), validate(lessonCreateRules), adminCreateLessonForLevel);
r.put("/admin/lessons/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(lessonUpdateRules), adminUpdateLesson);
r.put("/admin/lessons/:id/active", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(toggleActiveRules), adminToggleLesson);
r.delete("/admin/lessons/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), adminDeleteLesson);

// Public
r.get("/courses/:courseId/levels", validate(courseIdParam), publicListLevelsWithLessons);//test
r.get("/courses/:courseId/instructors/:instructorId/levels", validate(courseIdParam), validate(instructorIdParam), publicListLevelsByCourseAndInstructor);
r.get("/levels/:courseLevelId", optionalAuth ,validate(courseLevelIdParam), publicDetailLevel);
r.get("/levels/:courseLevelId/lessons", validate(courseLevelIdParam), publicListLessonsByLevel);//test

export default r;

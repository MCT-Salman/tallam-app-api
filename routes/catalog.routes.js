import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  domainCreateRules, subjectCreateRules, instructorCreateRules, courseCreateRules,
  toggleActiveRules, idParam, listQueryRules
} from "../validators/catalog.validators.js";
import {
  adminCreateDomain, adminListDomains, adminUpdateDomain, adminToggleDomain,
  adminCreateSubject, adminListSubjects, adminUpdateSubject, adminToggleSubject,
  adminCreateInstructor, adminListInstructors, adminUpdateInstructor, adminToggleInstructor,
  adminCreateCourse, adminUpdateCourse, adminToggleCourse,
  publicListCourses, publicGetCourse
} from "../controllers/catalog.controller.js";

const r = Router();

// Admin routes (require ADMIN)
r.post("/admin/domains", requireAuth, requireRole(["ADMIN"]), validate(domainCreateRules), adminCreateDomain);
r.get("/admin/domains", requireAuth, requireRole(["ADMIN"]), adminListDomains);
r.put("/admin/domains/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(domainCreateRules), adminUpdateDomain);
r.put("/admin/domains/:id/active", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(toggleActiveRules), adminToggleDomain);

r.post("/admin/subjects", requireAuth, requireRole(["ADMIN"]), validate(subjectCreateRules), adminCreateSubject);
r.get("/admin/subjects", requireAuth, requireRole(["ADMIN"]), adminListSubjects);
r.put("/admin/subjects/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(subjectCreateRules), adminUpdateSubject);
r.put("/admin/subjects/:id/active", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(toggleActiveRules), adminToggleSubject);

r.post("/admin/instructors", requireAuth, requireRole(["ADMIN"]), validate(instructorCreateRules), adminCreateInstructor);
r.get("/admin/instructors", requireAuth, requireRole(["ADMIN"]), adminListInstructors);
r.put("/admin/instructors/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(instructorCreateRules), adminUpdateInstructor);
r.put("/admin/instructors/:id/active", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(toggleActiveRules), adminToggleInstructor);

r.post("/admin/courses", requireAuth, requireRole(["ADMIN"]), validate(courseCreateRules), adminCreateCourse);
r.put("/admin/courses/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(courseCreateRules), adminUpdateCourse);
r.put("/admin/courses/:id/active", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(toggleActiveRules), adminToggleCourse);

// Public routes
r.get("/courses", validate(listQueryRules), publicListCourses);
r.get("/courses/:id", validate(idParam), publicGetCourse);

export default r;

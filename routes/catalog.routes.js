import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth, optionalAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  domainCreateRules, specializationCreateRules, subjectCreateRules, instructorCreateRules, courseCreateRules, courseUpdateRules,
  toggleActiveRules, idParam, listQueryRules
} from "../validators/catalog.validators.js";
import {
  adminCreateDomain, adminListDomains, adminUpdateDomain, adminToggleDomain,adminDeleteDomain,
  adminCreateSpecialization, adminListSpecializations, publicListSpecializationsByDomain, adminUpdateSpecialization, adminToggleSpecialization, adminDeleteSpecialization,
  adminCreateSubject, adminListSubjects, adminUpdateSubject, adminToggleSubject, adminDeleteSubject,
  adminCreateInstructor, adminListInstructors, adminUpdateInstructor, adminToggleInstructor, adminDeleteInstructor,
  adminCreateCourse, adminUpdateCourse, adminToggleCourse, adminDeleteCourse, adminListCourses,
  publicListCourses, publicGetCourse
} from "../controllers/catalog.controller.js";

const r = Router();

// Admin routes (require ADMIN)
r.get("/admin/domains", requireAuth, requireRole(["ADMIN"]), adminListDomains);
r.post("/admin/domains", requireAuth, requireRole(["ADMIN"]), validate(domainCreateRules), adminCreateDomain);
r.put("/admin/domains/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(domainCreateRules), adminUpdateDomain);
r.put("/admin/domains/:id/active", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(toggleActiveRules), adminToggleDomain);
r.delete("/admin/domains/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), adminDeleteDomain);

// Specializations
r.get("/admin/specializations", requireAuth, requireRole(["ADMIN"]), adminListSpecializations);
r.get("/admin/domains/:id/specializations",validate(idParam),publicListSpecializationsByDomain);
r.post("/admin/domains/:id/specializations",requireAuth,requireRole(["ADMIN"]),validate(specializationCreateRules),adminCreateSpecialization);
r.put("/admin/specializations/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(specializationCreateRules), adminUpdateSpecialization);
r.put("/admin/specializations/:id/active", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(toggleActiveRules), adminToggleSpecialization);
r.delete("/admin/specializations/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), adminDeleteSpecialization);

// Subjects
r.get("/admin/subjects", requireAuth, requireRole(["ADMIN"]), adminListSubjects);
r.post("/admin/subjects", requireAuth, requireRole(["ADMIN"]), validate(subjectCreateRules), adminCreateSubject);
r.put("/admin/subjects/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(subjectCreateRules), adminUpdateSubject);
r.put("/admin/subjects/:id/active", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(toggleActiveRules), adminToggleSubject);
r.delete("/admin/subjects/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), adminDeleteSubject);

// Instructors
r.get("/admin/instructors", requireAuth, requireRole(["ADMIN"]), adminListInstructors);
r.post("/admin/instructors", requireAuth, requireRole(["ADMIN"]), validate(instructorCreateRules), adminCreateInstructor);
r.put("/admin/instructors/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(instructorCreateRules), adminUpdateInstructor);
r.put("/admin/instructors/:id/active", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(toggleActiveRules), adminToggleInstructor);
r.delete("/admin/instructors/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), adminDeleteInstructor);

// Courses
r.get("/admin/courses", requireAuth, requireRole(["ADMIN", "SUBADMIN"]), validate(listQueryRules), adminListCourses);
r.post("/admin/courses", requireAuth, requireRole(["ADMIN"]), validate(courseCreateRules), adminCreateCourse);
r.put("/admin/courses/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(courseUpdateRules), adminUpdateCourse);
r.put("/admin/courses/:id/active", requireAuth, requireRole(["ADMIN"]), validate(idParam), validate(toggleActiveRules), adminToggleCourse);
r.delete("/admin/courses/:id", requireAuth, requireRole(["ADMIN"]), validate(idParam), adminDeleteCourse);

// Public routes
r.get("/courses", validate(listQueryRules), publicListCourses);
r.get("/courses/:id", optionalAuth, validate(idParam), publicGetCourse);

export default r;

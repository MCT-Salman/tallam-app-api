import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  studentCreateReview,
  publicGetReviewsForCourseLevel,
  studentGetMyReview,
  studentUpdateReview,
  studentDeleteReview,
  publicGetReviewStats,
  adminGetAllReviews
} from "../controllers/review.controller.js";
import {
  createReviewRules,
  updateReviewRules,
  courseLevelIdParam,
  reviewIdParam,
  reviewListQueryRules
} from "../validators/review.validators.js";

const router = Router();

// Public routes - no authentication required
router.get("/courselevels/:courseLevelId", validate(courseLevelIdParam), validate(reviewListQueryRules), publicGetReviewsForCourseLevel);

router.get("/courselevels/:courseLevelId/stats", validate(courseLevelIdParam), publicGetReviewStats);

// Student routes - authentication required
router.use(requireAuth); // All routes below require authentication

router.post("/courselevels/:courseLevelId", requireRole(['STUDENT']), validate(courseLevelIdParam), validate(createReviewRules), studentCreateReview);

router.get("/courselevels/:courseLevelId/mine", requireRole(['STUDENT']), validate(courseLevelIdParam), studentGetMyReview);

router.put("/:reviewId", requireRole(['STUDENT']), validate(reviewIdParam), validate(updateReviewRules), studentUpdateReview);

router.delete("/:reviewId", requireRole(['STUDENT']), validate(reviewIdParam), studentDeleteReview);

router.get("/all", requireRole(['ADMIN', 'SUBADMIN']), validate(reviewListQueryRules), adminGetAllReviews);

export default router;

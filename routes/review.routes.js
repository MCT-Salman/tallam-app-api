import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  studentCreateReview,
  publicGetReviewsForCourseLevel,
  studentGetMyReview,
  studentUpdateReview,
  studentDeleteReview,
  publicGetReviewStats
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

router.post("/courselevels/:courseLevelId", validate(courseLevelIdParam), validate(createReviewRules), studentCreateReview);

router.get("/courselevels/:courseLevelId/mine", validate(courseLevelIdParam), studentGetMyReview);

router.put("/:reviewId", validate(reviewIdParam), validate(updateReviewRules), studentUpdateReview);

router.delete("/:reviewId", validate(reviewIdParam), studentDeleteReview);

export default router;

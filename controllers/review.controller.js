import { serializeResponse } from "../utils/serialize.js";
import prisma from "../prisma/client.js";
import {
  createReview,
  getReviewsForCourseLevel,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewStats,
  getReviewsForCourseLevelAdmin
} from "../services/review.service.js";

/**
 * Student: Create a review for a course level
 * POST /api/reviews/course-levels/:courseLevelId
 */
export const studentCreateReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const courseLevelId = parseInt(req.params.courseLevelId, 10);
    const { rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "التقييم يجب أن يكون بين 1 و 5"
      });
    }

    const review = await createReview(userId, courseLevelId, rating, comment);

    res.status(201).json({
      success: true,
      message: "تم إضافة التقييم بنجاح",
      data: serializeResponse(review)
    });
  } catch (error) {
    if (error.message.includes("مسجل مسبقاً")) {
      error.statusCode = 409; // Conflict
    } else {
      error.statusCode = error.statusCode || 400;
    }
    next(error);
  }
};

/**
 * Get reviews for a course level (public access)
 * GET /api/reviews/course-levels/:courseLevelId
 */
export const publicGetReviewsForCourseLevel = async (req, res, next) => {
  try {
    const courseLevelId = parseInt(req.params.courseLevelId, 10);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await getReviewsForCourseLevel(courseLevelId, { page, limit });

    res.json({
      success: true,
      message: "تم جلب التقييمات بنجاح",
      data: {
        reviews: serializeResponse(result.reviews),
        stats: result.stats,
        pagination: result.pagination
      }
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

/**
 * Student: Get their own review for a course level
 * GET /api/reviews/course-levels/:courseLevelId/mine
 */
export const studentGetMyReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const courseLevelId = parseInt(req.params.courseLevelId, 10);

    // Find review by user and course level
    const review = await prisma.review.findFirst({
      where: { userId, courseLevelId },
      include: {
        user: {
          select: { name: true, avatarUrl: true }
        },
        courseLevel: {
          select: { name: true, course: { select: { title: true } } }
        }
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "لم تقم بتقييم هذا المستوى بعد"
      });
    }

    res.json({
      success: true,
      message: "تم جلب التقييم بنجاح",
      data: serializeResponse(review)
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

/**
 * Student: Update their own review
 * PUT /api/reviews/:reviewId
 */
export const studentUpdateReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reviewId = parseInt(req.params.reviewId, 10);

    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "معرّف التقييم غير صالح"
      });
    }

    const { rating, comment } = req.body;

    // التحقق من صحة التقييم إذا تم إرساله
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "التقييم يجب أن يكون بين 1 و 5"
      });
    }

    // 🔹 جلب التقييم الحالي
    const existingReview = await getReviewById(reviewId);
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "التقييم غير موجود"
      });
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = parseInt(rating, 10);
    if (comment !== undefined) updateData.comment = comment;

    // لا يوجد أي بيانات جديدة للتحديث
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "لم يتم إرسال أي بيانات للتحديث"
      });
    }
    const updatedReview = await updateReview(reviewId, updateData);

    res.json({
      success: true,
      message: "تم تحديث التقييم بنجاح",
      data: serializeResponse(updatedReview)
    });

  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};


/**
 * Student: Delete their own review
 * DELETE /api/reviews/:reviewId
 */
export const studentDeleteReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reviewId = parseInt(req.params.reviewId, 10);

    await deleteReview(reviewId, userId);

    res.json({
      success: true,
      message: "تم حذف التقييم بنجاح"
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

/**
 * Get review statistics for a course level
 * GET /api/reviews/course-levels/:courseLevelId/stats
 */
export const publicGetReviewStats = async (req, res, next) => {
  try {
    const courseLevelId = parseInt(req.params.courseLevelId, 10);

    const stats = await getReviewStats(courseLevelId);

    res.json({
      success: true,
      message: "تم جلب إحصائيات التقييمات بنجاح",
      data: stats
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

/**
 * Admin: Get all reviews with filtering and pagination
 * GET /api/reviews/all
 */
export const adminGetAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, courseLevelId, userId } = req.query;

    const result = await getReviewsForCourseLevelAdmin(courseLevelId, { page, limit }, userId);

    res.json({
      success: true,
      message: "تم جلب التقييمات بنجاح",
      data: {
        reviews: serializeResponse(result.reviews),
        stats: result.stats,
        pagination: result.pagination
      }
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

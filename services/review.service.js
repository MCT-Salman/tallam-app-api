import prisma from "../prisma/client.js";
import { QUIZ_NOT_FOUND } from "../validators/messagesResponse.js";

/**
 * Create a new review for a course level
 * @param {number} userId - ID of the user creating the review
 * @param {number} courseLevelId - ID of the course level being reviewed
 * @param {number} rating - Rating from 1-5
 * @param {string} comment - Optional comment
 * @returns {Promise<Object>} - Created review object
 */
export const createReview = async (userId, courseLevelId, rating, comment) => {
  // Check if course level exists
  const courseLevel = await prisma.courseLevel.findUnique({
    where: { id: courseLevelId },
    select: { id: true, name: true, course: { select: { title: true } } }
  });

  if (!courseLevel) {
    throw new Error("المستوى غير موجود");
  }

  // Check if user already reviewed this course level
  const existingReview = await prisma.review.findFirst({
    where: { userId, courseLevelId }
  });

  if (existingReview) {
    throw new Error("لقد قمت بتقييم هذا المستوى مسبقاً");
  }

  // Create the review
  const review = await prisma.review.create({
    data: {
      userId,
      courseLevelId,
      rating,
      comment
    },
    include: {
      user: {
        select: { name: true, avatarUrl: true }
      },
      courseLevel: {
        select: { name: true, course: { select: { title: true } } }
      }
    }
  });

  return review;
};

/**
 * Get reviews for a specific course level with pagination
 * @param {number} courseLevelId - ID of the course level
 * @param {Object} pagination - { page, limit }
 * @returns {Promise<Object>} - Reviews with pagination info
 */
export const getReviewsForCourseLevel = async (courseLevelId, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;
  const take = limit;

  // Check if course level exists
  const courseLevel = await prisma.courseLevel.findUnique({
    where: { id: courseLevelId },
    select: { id: true, name: true }
  });

  if (!courseLevel) {
    throw new Error("المستوى غير موجود");
  }

  // Get reviews with user info
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { courseLevelId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, avatarUrl: true }
        }
      }
    }),
    prisma.review.count({ where: { courseLevelId } })
  ]);

  // Calculate average rating
  const avgRatingResult = await prisma.review.aggregate({
    where: { courseLevelId },
    _avg: { rating: true },
    _count: { rating: true }
  });

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    stats: {
      averageRating: Number(avgRatingResult._avg.rating?.toFixed(2) || 0),
      totalReviews: avgRatingResult._count.rating
    }
  };
};

/**
 * Get a specific review by ID
 * @param {number} reviewId - ID of the review
 * @param {number} userId - ID of the user (for authorization)
 * @returns {Promise<Object>} - Review object
 */
export const getReviewById = async (reviewId, userId) => {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId // Ensure user can only access their own reviews
    },
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
    throw new Error("التقييم غير موجود أو ليس لديك صلاحية الوصول إليه");
  }

  return review;
};

/**
 * Update a review
 * @param {number} reviewId - ID of the review to update
 * @param {number} userId - ID of the user (for authorization)
 * @param {number} rating - New rating (optional)
 * @param {string} comment - New comment (optional)
 * @returns {Promise<Object>} - Updated review object
 */
export const updateReview = async (reviewId, userId, rating, comment) => {
  // First check if the review exists and belongs to the user
  const existingReview = await prisma.review.findFirst({
    where: { id: reviewId, userId }
  });

  if (!existingReview) {
    throw new Error("التقييم غير موجود أو ليس لديك صلاحية تعديله");
  }

  // Update the review
  const updateData = {};
  if (rating !== undefined) updateData.rating = rating;
  if (comment !== undefined) updateData.comment = comment;

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: updateData,
    include: {
      user: {
        select: { name: true, avatarUrl: true }
      },
      courseLevel: {
        select: { name: true, course: { select: { title: true } } }
      }
    }
  });

  return updatedReview;
};

/**
 * Delete a review
 * @param {number} reviewId - ID of the review to delete
 * @param {number} userId - ID of the user (for authorization)
 * @returns {Promise<Object>} - Deleted review object
 */
export const deleteReview = async (reviewId, userId) => {
  // First check if the review exists and belongs to the user
  const existingReview = await prisma.review.findFirst({
    where: { id: reviewId, userId }
  });

  if (!existingReview) {
    throw new Error("التقييم غير موجود أو ليس لديك صلاحية حذفه");
  }

  // Delete the review
  const deletedReview = await prisma.review.delete({
    where: { id: reviewId }
  });

  return deletedReview;
};

/**
 * Get review statistics for a course level
 * @param {number} courseLevelId - ID of the course level
 * @returns {Promise<Object>} - Statistics object
 */
export const getReviewStats = async (courseLevelId) => {
  // Check if course level exists
  const courseLevel = await prisma.courseLevel.findUnique({
    where: { id: courseLevelId },
    select: { id: true, name: true }
  });

  if (!courseLevel) {
    throw new Error("المستوى غير موجود");
  }

  // Get statistics
  const stats = await prisma.review.aggregate({
    where: { courseLevelId },
    _count: { rating: true },
    _avg: { rating: true },
    _min: { rating: true },
    _max: { rating: true }
  });

  // Get rating distribution
  const ratingDistribution = await prisma.review.groupBy({
    by: ['rating'],
    where: { courseLevelId },
    _count: { rating: true }
  });

  return {
    totalReviews: stats._count.rating,
    averageRating: Number(stats._avg.rating?.toFixed(2) || 0),
    minRating: stats._min.rating,
    maxRating: stats._max.rating,
    ratingDistribution: ratingDistribution.map(item => ({
      rating: item.rating,
      count: item._count.rating
    }))
  };
};

import { body, param, query } from "express-validator";

/**
 * Validation rules for creating a review
 */
export const createReviewRules = [
  body("rating")
    .exists({ checkFalsy: true })
    .withMessage("التقييم مطلوب")
    .isInt({ min: 1, max: 5 })
    .withMessage("التقييم يجب أن يكون بين 1 و 5"),
  body("comment")
    .optional()
    .isString()
    .withMessage("التعليق يجب أن يكون نص")
    .isLength({ max: 500 })
    .withMessage("التعليق يجب ألا يتجاوز 500 حرف")
];

/**
 * Validation rules for updating a review
 */
export const updateReviewRules = [
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("التقييم يجب أن يكون بين 1 و 5"),
  body("comment")
    .optional()
    .isString()
    .withMessage("التعليق يجب أن يكون نص")
    .isLength({ max: 500 })
    .withMessage("التعليق يجب ألا يتجاوز 500 حرف")
];

/**
 * Validation for course level ID parameter
 */
export const courseLevelIdParam = param("courseLevelId")
  .isInt({ gt: 0 })
  .withMessage("معرف المستوى غير صالح");

/**
 * Validation for review ID parameter
 */
export const reviewIdParam = param("reviewId")
  .isInt({ gt: 0 })
  .withMessage("معرف التقييم غير صالح");

/**
 * Validation for pagination query parameters
 */
export const reviewListQueryRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("رقم الصفحة يجب أن يكون أكبر من 0"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("عدد العناصر يجب أن يكون بين 1 و 50")
];

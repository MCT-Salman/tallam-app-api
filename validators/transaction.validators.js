import { query, param } from "express-validator";

/**
 * Validation for transaction ID parameter
 */
export const transactionIdParam = param("id")
  .isInt({ gt: 0 })
  .withMessage("معرف المعاملة غير صالح");

/**
 * Validation for pagination query parameters
 */
export const transactionListQueryRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("رقم الصفحة يجب أن يكون أكبر من 0"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("عدد العناصر يجب أن يكون بين 1 و 100"),
  query("sortBy")
    .optional()
    .isIn(["id", "createdAt", "amountPaid", "updatedAt"])
    .withMessage("حقل الترتيب غير صالح"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("ترتيب الترتيب يجب أن يكون asc أو desc")
];

/**
 * Validation for filter query parameters
 */
export const transactionFilterQueryRules = [
  query("accessCodeId")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("معرف كود الوصول غير صالح"),
  query("couponId")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("معرف الكوبون غير صالح"),
  query("minAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("الحد الأدنى للمبلغ يجب أن يكون رقماً موجباً"),
  query("maxAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("الحد الأقصى للمبلغ يجب أن يكون رقماً موجباً"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("تاريخ البداية غير صالح"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("تاريخ النهاية غير صالح")
];

/**
 * Validation for analytics query parameters
 */
export const transactionAnalyticsQueryRules = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("تاريخ البداية غير صالح"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("تاريخ النهاية غير صالح"),
  query("groupBy")
    .optional()
    .isIn(["day", "week", "month"])
    .withMessage("نوع التجميع يجب أن يكون day أو week أو month")
];

/**
 * Combined validation rules for transactions list
 */
export const transactionListValidationRules = [
  ...transactionListQueryRules,
  ...transactionFilterQueryRules
];

/**
 * Combined validation rules for transaction analytics
 */
export const transactionAnalyticsValidationRules = [
  ...transactionAnalyticsQueryRules
];

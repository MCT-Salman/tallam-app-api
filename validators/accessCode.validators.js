import { body, oneOf } from 'express-validator';

export const generateCodesRules = [
  // Either courseLevelId or courseId must be provided
  oneOf([
    body('courseLevelId').exists().isInt({ gt: 0 }),
    body('courseId').exists().isInt({ gt: 0 }),
  ], 'يجب توفير courseLevelId أو courseId على الأقل'),
  body('courseLevelId')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('courseLevelId غير صالح'),
  body('courseId')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('courseId غير صالح'),
  body('count')
    .isInt({ gt: 0, lt: 101 })
    .withMessage('العدد يجب أن يكون بين 1 و 100'),
  body('validityInMonths')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('مدة الصلاحية بالأشهر يجب أن تكون رقماً صحيحاً أكبر من صفر'),
];

export const activateCodeRules = [
  body('code').isString().withMessage('الكود مطلوب').isLength({ min: 6 }).withMessage('صيغة الكود غير صحيحة'),
];


import { body } from 'express-validator';

export const generateCodesRules = [
  body('courseLevelId')
    .exists()
    .withMessage('courseLevelId مطلوب')
    .isInt({ gt: 0 })
    .withMessage('courseLevelId غير صالح'),
  body('userId')
    .exists()
    .withMessage('userId مطلوب')
    .isInt({ gt: 0 })
    .withMessage('userId غير صالح'),
  body('validityInMonths')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('مدة الصلاحية بالأشهر يجب أن تكون رقماً صحيحاً أكبر من صفر'),
];

export const activateCodeRules = [
  body('code').isString().withMessage('الكود مطلوب').isLength({ min: 6 }).withMessage('صيغة الكود غير صحيحة'),
];


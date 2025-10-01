import { body, param, query } from 'express-validator';

// ----- Admin Validators -----
export const couponCreateRules = [
  body('code').exists({ checkFalsy: true }).withMessage('code مطلوب').isString().isLength({ min: 3, max: 50 }).withMessage('طول code غير صالح'),
  body('discount').exists().withMessage('discount مطلوب').isFloat({ gt: 0 }).withMessage('discount يجب أن يكون رقمًا أكبر من صفر'),
  body('isPercent').optional().isBoolean(),
  body('expiry').optional().isISO8601().withMessage('expiry يجب أن يكون تاريخ ISO'),
  body('maxUsage').optional().isInt({ min: 1 }).withMessage('maxUsage يجب أن يكون رقمًا صحيحًا موجبًا'),
  body('isActive').optional().isBoolean(),
  body('courseLevelId').exists().withMessage('courseLevelId مطلوب').isInt({ gt: 0 }).withMessage('courseLevelId غير صالح'),
];

export const couponUpdateRules = [
  body('code').optional().isString().isLength({ min: 3, max: 50 }),
  body('discount').optional().isFloat({ gt: 0 }),
  body('isPercent').optional().isBoolean(),
  body('expiry').optional().isISO8601(),
  body('maxUsage').optional().isInt({ min: 1 }),
  body('isActive').optional().isBoolean(),
  body('courseLevelId').optional().isInt({ gt: 0 }),
];

export const couponIdParam = param('id').isInt({ gt: 0 }).withMessage('id غير صالح');
export const courseLevelIdParam = param('courseLevelId').isInt({ gt: 0 }).withMessage('courseLevelId غير صالح');

export const listQueryRules = [
  query('skip').optional().isInt({ min: 0 }),
  query('take').optional().isInt({ min: 1, max: 100 }),
];

// ----- Student Validators -----
export const studentCouponRules = [
  body('code').exists({ checkFalsy: true }).withMessage('code مطلوب').isString().isLength({ min: 3 }).withMessage('صيغة code غير صحيحة'),
  body('courseLevelId').exists().withMessage('courseLevelId مطلوب').isInt({ gt: 0 }).withMessage('courseLevelId غير صالح'),
];

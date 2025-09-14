import { body } from 'express-validator';
import { phoneValidator, passwordValidator, nameValidator, birthDateValidator, sexValidator } from './auth.validators.js';

export const adminCreateUserRules = [
  phoneValidator,
  passwordValidator,
  body("name").exists({ checkFalsy: true }).withMessage("الاسم مطلوب"),
  body("birthDate").exists({ checkFalsy: true }).withMessage("تاريخ الميلاد مطلوب").isISO8601().withMessage("صيغة تاريخ الميلاد غير صحيحة"),
  sexValidator,
  body('role').optional().isIn(['STUDENT', 'SUBADMIN', 'ADMIN']),
  body('isActive').optional().isBoolean(),
];

export const adminUpdateUserRules = [
  // Phone is optional, but if present, must be valid
  body('phone').optional().isString().custom((value) => {
    if (!value.startsWith('+')) throw new Error('رقم الهاتف يجب أن يبدأ برمز الدولة (+)');
    return true;
  }),
  // Password is optional, but if present, must be valid
  body('password').optional().isLength({ min: 8 }).withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  nameValidator.optional(),
  birthDateValidator.optional(),
  body('sex').optional().isIn(['ذ', 'ا','أ', 'ذكر', 'انثى','أنثى']),
  body('role').optional().isIn(['STUDENT', 'SUBADMIN', 'ADMIN']),
  body('isActive').optional().isBoolean(),
];

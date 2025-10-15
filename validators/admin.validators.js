import { body, param, query } from "express-validator";
import { phoneValidator, nameValidator, birthDateValidator, sexValidator } from './auth.validators.js';

export const adminLoginRules = [
  body("identifier")
    .exists({ checkFalsy: true }).withMessage("المعرف (البريد أو اسم المستخدم) مطلوب")
    .isString().withMessage("المعرف يجب أن يكون نصاً")
    .isLength({ min: 3 }).withMessage("المعرف قصير جداً"),
  body("password")
    .exists({ checkFalsy: true }).withMessage("كلمة المرور مطلوبة")
    .isString().withMessage("كلمة المرور يجب أن تكون نصاً")
    .isLength({ min: 6 }).withMessage("كلمة المرور قصيرة جداً")
];

export const addAdminRules = [
  phoneValidator.exists(),
  nameValidator.optional(),
  birthDateValidator.optional(),
  sexValidator.optional(),
  body('role').optional().isIn(['SUBADMIN', 'ADMIN']).withMessage("الدور غير صالح"),
  body("username")
    .exists({ checkFalsy: true }).withMessage("اسم المستخدم مطلوب")
    .isString().withMessage("اسم المستخدم يجب أن يكون نص")
    .isLength({ min: 3 }).withMessage("اسم المستخدم قصير"),
  body("email")
    .exists({ checkFalsy: true }).withMessage("البريد الإلكتروني مطلوب")
    .isString().withMessage("البريد الإلكتروني يجب أن يكون نص")
    .isEmail().withMessage("البريد الإلكتروني غير صالح"),
  body("password")
    .exists({ checkFalsy: true }).withMessage("كلمة المرور مطلوبة")
    .isString().withMessage("كلمة المرور يجب أن تكون نص")
    .isLength({ min: 6 }).withMessage("كلمة المرور قصيرة")
];

export const updateAdminRules = [
  param('id')
    .isInt({ min: 1 }).withMessage("معرف المشرف يجب أن يكون رقم صحيح موجب"),
  phoneValidator.optional(),
  nameValidator.optional(),
  body('role').optional().isIn(['SUBADMIN', 'ADMIN']).withMessage("الدور غير صالح"),
  body("username")
    .optional()
    .isString().withMessage("اسم المستخدم يجب أن يكون نص")
    .isLength({ min: 3 }).withMessage("اسم المستخدم قصير"),
  body("email")
    .optional()
    .isString().withMessage("البريد الإلكتروني يجب أن يكون نص")
    .isEmail().withMessage("البريد الإلكتروني غير صالح"),
  body("password")
    .optional()
    .isString().withMessage("كلمة المرور يجب أن تكون نص")
    .isLength({ min: 6 }).withMessage("كلمة المرور قصيرة"),
  body("isActive")
    .optional()
    .isBoolean().withMessage("حالة التفعيل يجب أن تكون true أو false")
];

export const adminIdParam = [
  param('id')
    .isInt({ min: 1 }).withMessage("معرف المشرف يجب أن يكون رقم صحيح ")
];

export const listAdminsQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage("رقم الصفحة يجب أن يكون رقم صحيح موجب"),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("حد العناصر يجب أن يكون بين 1 و 100")
];

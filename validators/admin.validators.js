import { body } from "express-validator";
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

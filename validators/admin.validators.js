import { body } from "express-validator";

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

import { body } from "express-validator";
import { getCountryFromPhone } from "../utils/phoneCountry.js";

export const phoneValidator = body("phone")
  .exists({ checkFalsy: true }).withMessage("رقم الهاتف مطلوب")
  .isString().withMessage("رقم الهاتف يجب أن يكون نصاً")
  .custom((value) => {
    if (!value || typeof value !== 'string') throw new Error("رقم الهاتف غير صالح");
    const trimmed = value.replace(/\s+/g, '').trim();
    if (!trimmed.startsWith('+')) {
      throw new Error("رقم الهاتف يجب أن يبدأ برمز الدولة (+)");
    }
    const info = getCountryFromPhone(trimmed);
    if (!info.success) {
      throw new Error(info.error || "رقم الهاتف غير صالح");
    }
    return true;
  });

// Validator مخفف لصفحة تسجيل الدخول حتى لا نفصح عن تفاصيل صيغة الهاتف
export const loginPhoneValidator = body("phone")
  .exists({ checkFalsy: true }).withMessage("بيانات تسجيل الدخول غير صحيحة")
  .isString().withMessage("بيانات تسجيل الدخول غير صحيحة")
  .isLength({ min: 6 }).withMessage("بيانات تسجيل الدخول غير صحيحة");

export const nameValidator = body("name")
  .optional()
  .isString().withMessage("الاسم يجب أن يكون نصاً")
  .isLength({ min: 2 }).withMessage("الاسم قصير جداً");
export const requiredName = body("name")
  .exists({ checkFalsy: true }).withMessage("الاسم مطلوب")
  .isString().withMessage("الاسم يجب أن يكون نصاً")
  .isLength({ min: 2 }).withMessage("الاسم قصير جداً");

export const birthDateValidator = body("birthDate")
  .optional()
  .isISO8601().withMessage("تاريخ الميلاد يجب أن يكون بصيغة تاريخ صحيحة");
export const requiredBirthDate = body("birthDate")
  .exists({ checkFalsy: true }).withMessage("تاريخ الميلاد مطلوب")
  .isISO8601().withMessage("تاريخ الميلاد يجب أن يكون بصيغة تاريخ صحيحة");

export const sexValidator = body("sex")
  .exists({ checkFalsy: true }).withMessage("نوع الجنس مطلوب")
  .isString().withMessage("الحقل يجب أن يكون نصاً")
  .isIn(["ذ", "ا", "أ", "ذكر", "انثى", "أنثى"]).withMessage("القيمة غير صالحة للحقل sex");

export const sexValidatorUpdate = body("sex")
  .optional()
  .isString().withMessage("الحقل يجب أن يكون نصاً")
  .isIn(["ذ", "ا", "أ", "ذكر", "انثى", "أنثى"]).withMessage("القيمة غير صالحة للحقل sex");

export const TokenValidator = body("Token")
  .exists({ checkFalsy: true }).withMessage("token مطلوب")
  .isString().withMessage("token يجب أن يكون نصاً");

export const refreshTokenValidator = body("refreshToken")
  .exists({ checkFalsy: true }).withMessage("Refresh token مطلوب")
  .isString().withMessage("Refresh token يجب أن يكون نصاً");

export const otpCodeValidator = body("code")
  .exists({ checkFalsy: true }).withMessage("رمز OTP مطلوب")
  .isLength({ min: 4, max: 6 }).withMessage("رمز OTP غير صالح");

export const resetTokenValidator = body("resetToken")
  .exists({ checkFalsy: true }).withMessage("Reset token مطلوب")
  .isString().withMessage("Reset token يجب أن يكون نصاً");

export const registerRules = [
  phoneValidator,
  requiredName,
  requiredBirthDate,
  sexValidator,
];

export const phoneNumber = [phoneValidator]

export const loginRules = [
  loginPhoneValidator
];

export const refreshRules = [refreshTokenValidator];

export const forgotRequestOtpRules = [phoneValidator];
export const forgotVerifyOtpRules = [phoneValidator, otpCodeValidator];

export const profileUpdateRules = [nameValidator, birthDateValidator, sexValidatorUpdate];

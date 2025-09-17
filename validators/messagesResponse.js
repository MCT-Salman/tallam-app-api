// true and false and server failure messages
export const SUCCESS_REQUEST = true
export const FAILURE_REQUEST = false
export const ERROR_SERVER = "خطأ في الخادم"

// otp messages
export const OTP_SUCCESS_REQUEST = "تم إرسال رمز التحقق بنجاح"
export const OTP_ALREADY_VERIFIED = "رقم الهاتف مؤكد مسبقاً"
export const FAILURE_OTP_CODE = "رمز التحقق غير صالح"
export const OTP_CODE_EXPIRED = "انتهت صلاحية رمز التحقق"
export const OTP_SUCCESS_VERIFY = "تم التحقق من الرمز بنجاح"
export const OTP_TIME_OUT_OTP = 2 * 60 * 1000

// auth (Middleware) messages
export const NO_AUTH = "ليس لديك الصلاحية"
export const INSUFFICIENT_PERMISSIONS = "صلاحياتك غير كافية لتنفيذ هذا الإجراء"
export const USER_NOT_FOUND = "المستخدم غير موجود"
export const NOT_VERIFIED = "لم يتم التحقق من الحساب" 
export const CANCELD_SESSION = "تم إلغاء الجلسة"
export const TOKEN_EXPIRED = "انتهت صلاحية الجلسة"
export const TOKEN_NOT_CORRECT = "رمز الجلسة غير صالح"

// auth (register) messages
export const NUMBER_ALREADY_EXIST = "رقم الهاتف مسجل مسبقاً"
export const THIS_NUMBER_NOT_VERIFIED_BY_OTP = "لم يتم التحقق عبر رمز التحقق لهذا الرقم"
export const MISSED_DATA_REGISTER = "يرجى إدخال كافة البيانات "
export const MISSED_COMPLETE_INFO_REGISTER = "لم يتم إكمال البيانات الشخصية "
export const SUCCESS_REGISTER = "تم تسجيل الحساب بنجاح"
export const ERROR_MAX_TRY_REGISTER = "تم تجاوز الحد الأقصى لمحاولات التسجيل"
export const MAX_TRY_FAILURE_REGISTER = 5
export const TIME_TRY_AFTER_FAILURE_REGISTER = 10 * 60 * 1000

// auth (login) messages
export const MAX_TRY_FAILURE_LOGIN = 5
export const TIME_TRY_AFTER_FAILURE_LOGIN = 5 * 60 * 1000
export const LOCKOUT_TIME_LOGIN = 5 * 60 * 1000
export const CLEANUP_LIMIT = 5 * 60 * 1000
export const ACCOUNT_EXPIRED = "انتهت صلاحية حسابك"
export const ACCOUNT_LOCKED_LOGIN = "تم قفل الحساب"
export const USER_NOT_FOUND_LOGIN = "هذا الحساب غير مسجل مسبقاَ"
export const PHONENUMBER_OR_PASSWORD_FAILED = "رقم الهاتف أو كلمة المرور خاطئة"
export const IN_ACTIVE_ACCOUNT = "الحساب معطل"
export const SUCCESS_LOGIN = "تم تسجيل الدخول بنجاح"

// auth (logout) messages
export const SUCCESS_LOGOUT = "تم تسجيل الخروج بنجاح"
export const FAILURE_LOGOUT = "فشل في تسجيل الخروج"

// phone number format message
export const ERROR_PHONE_NUMBER_FORMAT = " (+) رقم الهاتف يجب أن يبدأ برمز الدولة"
export const ERROR_PHONE_NUMBER = "رقم الهاتف غير صحيح"

// auth (forgot password) messages
export const PHONE_NUMBER_REQUIRED = "رقم الهاتف مطلوب"
export const USER_NOT_FOUND_FORGET = "المستخدم غير موجود"
export const CHANGE_PASSWORD_SUCCESSFULLY = "تم تغيير كلمة المرور بنجاح"

// referesh token messages
export const REFERESH_TOKEN_REQUIRED = "Refresh token مطلوب"
export const SUCCESS_REFERESH_TOKEN = "تم تجديد التوكن بنجاح"
export const FALIURE_REFERESH_TOKEN = "فشل في تجديد التوكن"

// profile messages
export const USER_NOT_FOUND_PROFILE = "المستخدم غير موجود"
export const CURRENT_PASSWORD_REQUIRED_TO_CHANGE_FROM_PROFILE = "يجب إدخال كلمة المرور الحالية لتغيير كلمة المرور"
export const CURRENT_PASSWORD_NOT_CORRECT_PROFILE = "كلمة المرور الحالية غير صحيحة"
export const UPDATE_PROFILE_INFO_SUCCESSFULLY = "تم تحديث الملف الشخصي بنجاح"

// Catalog & Purchase messages
export const COURSE_NOT_FOUND = "الدورة غير موجودة";
export const ALREADY_REQUESTED_CODE = "لديك طلب قيد المراجعة لهذه الدورة بالفعل.";

// Quiz messages
export const QUIZ_NOT_FOUND = "الاختبار غير موجود";
export const QUIZ_NO_ACCESS = "ليس لديك صلاحية الوصول لهذا الاختبار";
export const QUIZ_ALREADY_TAKEN = "لقد قمت بتقديم هذا الاختبار مسبقاً.";
export const QUIZ_ALREADY_EXISTS = "هذه الدورة لديها اختبار بالفعل.";
export const QUESTION_NEEDS_CORRECT_OPTION = "يجب أن يحتوي السؤال على خيار صحيح واحد على الأقل.";
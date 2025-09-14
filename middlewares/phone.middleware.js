import { getCountryFromPhone } from "../utils/phoneCountry.js";

// يقوم بتطبيع رقم الهاتف إلى صيغة E.164 باستخدام getCountryFromPhone
// إذا كان الحقل غير موجود يمر بدون تغيير
export const normalizePhoneE164 = (req, res, next) => {
  try {
    if (req.body && typeof req.body.phone === 'string') {
      const trimmed = req.body.phone.replace(/\s+/g, '').trim();
      const info = getCountryFromPhone(trimmed);
      if (info && info.success && info.phone) {
        req.body.phone = info.phone; // E.164
        req.body.country = info.countryName;
        req.body.countryCode = info.countryCode;
      }
    }
  } catch (_) {
    // تجاهل الأخطاء؛ التحقق الرسمي سيتم في الـ validators
  }
  next();
};

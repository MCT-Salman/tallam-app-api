// ميدلوير لتحديد معدل طلبات OTP لكل رقم هاتف

import { FAILURE_REQUEST, PHONE_NUMBER_REQUIRED } from "../validators/messagesResponse.js";
import { BAD_REQUEST_STATUS_CODE } from "../validators/statusCode.js";

// إعدادات افتراضية: 3 طلبات خلال 10 دقائق، وفاصل 60 ثانية بين الطلبات لنفس الرقم
const store = new Map(); // key: phone, value: { count, first, last }

const MAX_REQUESTS = parseInt(process.env.OTP_MAX_REQUESTS || '3', 10);
const WINDOW_MS = parseInt(process.env.OTP_WINDOW_MS || String(10 * 60 * 1000), 10);
const MIN_INTERVAL_MS = parseInt(process.env.OTP_MIN_INTERVAL_MS || String(60 * 1000), 10);

export const otpRateLimitByPhone = (req, res, next) => {
  const phone = (req.body && req.body.phone) ? String(req.body.phone).trim() : null;
  if (!phone) {
    return res.status(BAD_REQUEST_STATUS_CODE).json({ 
      success: FAILURE_REQUEST, 
      message: PHONE_NUMBER_REQUIRED,
      data:{}
    });
  }

  const now = Date.now();
  const data = store.get(phone) || { count: 0, first: now, last: 0 };

  // إعادة ضبط النافذة إذا انتهت
  if (now - data.first > WINDOW_MS) {
    data.count = 0;
    data.first = now;
  }

  // تحقق من الفاصل الزمني الأدنى بين الطلبات
  if (data.last && (now - data.last) < MIN_INTERVAL_MS) {
    const waitSec = Math.ceil((MIN_INTERVAL_MS - (now - data.last)) / 1000);
    return res.status(429).json({ 
      success: FAILURE_REQUEST, 
      message: `فضلاً انتظر ${waitSec} ثانية قبل طلب رمز آخر`,
      data:{
        retryAfterSeconds: waitSec
      }
    });
  }

  // تحقق من الحد الأقصى للطلبات في النافذة
  if (data.count >= MAX_REQUESTS) {
    const waitMs = Math.max(0, WINDOW_MS - (now - data.first));
    const waitMin = Math.ceil(waitMs / 60000);
    const waitSec = Math.ceil(waitMs / 1000);
    return res.status(429).json({ 
      success: FAILURE_REQUEST, 
        message: `تم تجاوز حد طلبات OTP. حاول مرة أخرى بعد ${waitMin} دقيقة`,
        data:{
          retryAfterSeconds: waitSec
        }
    });
  }

  // مرر الطلب وحدث العداد بعد نجاح إرسال OTP (في الكونترولر)
  // ملاحظة: سنحدّث العدّاد في نهاية السلسلة عبر res.on('finish') إذا الحالة 200
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const current = store.get(phone) || { count: 0, first: now, last: 0 };
      if (Date.now() - current.first > WINDOW_MS) {
        current.count = 0; current.first = Date.now();
      }
      current.count += 1;
      current.last = Date.now();
      store.set(phone, current);
    }
  });

  next();
};

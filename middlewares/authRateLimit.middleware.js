import rateLimit from 'express-rate-limit';
import { ERROR_MAX_TRY_REGISTER, FAILURE_REQUEST, MAX_TRY_FAILURE_REGISTER, TIME_TRY_AFTER_FAILURE_REGISTER } from '../validators/messagesResponse.js';

// محدد معدل خاص بمسارات المصادقة الحساسة فقط (login/register/refresh)
export const authRateLimit = rateLimit({
  windowMs: TIME_TRY_AFTER_FAILURE_REGISTER, 
  max: MAX_TRY_FAILURE_REGISTER, 
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const resetTime = req.rateLimit?.resetTime instanceof Date ? req.rateLimit.resetTime.getTime() : null;
    const now = Date.now();
    const retryAfterSeconds = resetTime ? Math.max(1, Math.ceil((resetTime - now) / 1000)) : undefined;
    const waitMin = retryAfterSeconds ? Math.ceil(retryAfterSeconds / 60) : undefined;
    return res.status(429).json({
      success: FAILURE_REQUEST,
      message: ERROR_MAX_TRY_REGISTER,
        ...(retryAfterSeconds ? { waitMessage: waitMin >= 1 ? `يرجى الانتظار حوالي ${waitMin} دقيقة قبل المحاولة مجدداً` : `يرجى الانتظار ${retryAfterSeconds} ثانية قبل المحاولة مجدداً` } : {}),
        ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
        data:{}
    });
  }
});

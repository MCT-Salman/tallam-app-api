import express from 'express';
import { 
  register, 
  login, 
  refresh, 
  logout, 
  logoutAll,
  getSessions,
  revokeSessionById,
  getProfile,
  updateProfile,
  forgotRequestOtp,
  forgotVerifyOtp
} from '../controllers/auth.controller.js';
import { 
  requireAuth, 
  optionalAuth, 
  logRequest 
} from '../middlewares/auth.middleware.js';
import { uploadAvatar } from '../utils/upload.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerRules, loginRules, refreshRules, forgotRequestOtpRules, forgotVerifyOtpRules, profileUpdateRules } from '../validators/auth.validators.js';
import { normalizePhoneE164 } from '../middlewares/phone.middleware.js';
import { otpRateLimitByPhone } from '../middlewares/otpRateLimit.middleware.js';
import { authRateLimit } from '../middlewares/authRateLimit.middleware.js';

const router = express.Router();

// تطبيق middleware لتسجيل الطلبات على جميع المسارات
router.use(logRequest);

// مسارات المصادقة العامة (لا تتطلب مصادقة)
router.post('/register',  uploadAvatar.single('avatar'), normalizePhoneE164, validate(registerRules), register);
router.post('/login',  normalizePhoneE164, validate(loginRules), login);
router.post('/refresh',  validate(refreshRules), refresh);
// router.post('/register', authRateLimit, uploadAvatar.single('avatar'), normalizePhoneE164, validate(registerRules), register);
// router.post('/login', authRateLimit, normalizePhoneE164, validate(loginRules), login);
// router.post('/refresh', authRateLimit, validate(refreshRules), refresh);
// نسيت كلمة المرور
// router.post('/forgot/request-otp', normalizePhoneE164, otpRateLimitByPhone, validate(forgotRequestOtpRules), forgotRequestOtp);
router.post('/forgot/request-otp', normalizePhoneE164, validate(forgotRequestOtpRules), forgotRequestOtp);
// router.post('/forgot/verify-otp', normalizePhoneE164, otpRateLimitByPhone, validate(forgotVerifyOtpRules), forgotVerifyOtp);
router.post('/forgot/verify-otp', normalizePhoneE164, validate(forgotVerifyOtpRules), forgotVerifyOtp);

// مسارات تتطلب مصادقة
router.use(requireAuth); // تطبيق middleware المصادقة على جميع المسارات التالية

// إدارة الجلسات
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.get('/sessions', getSessions);
router.delete('/sessions/:sessionId', revokeSessionById);

// إدارة الملف الشخصي
router.get('/profile', getProfile);
router.put('/profile', uploadAvatar.single('avatar'), validate(profileUpdateRules), updateProfile);

export default router;


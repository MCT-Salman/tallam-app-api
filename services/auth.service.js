import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateTokenPair, refreshAccessToken, revokeAllUserRefreshTokens, revokeRefreshToken, revokeUserRefreshTokensExceptSession } from "../utils/jwt.js";
import { getRealIP } from "../utils/ip.js";
import { rateLimiter } from "../utils/rateLimiter.js";
import { getCountryFromPhone, validatePhoneNumber } from "../utils/phoneCountry.js";
import { updateSessionWithIPInfo } from "../utils/geoLocation.js";
import { OtpCodeModel, SessionModel, UserModel } from "../models/index.js";
import { ACCOUNT_LOCKED_LOGIN, FAILURE_LOGOUT, FAILURE_REQUEST, FALIURE_REFERESH_TOKEN, IN_ACTIVE_ACCOUNT, MISSED_COMPLETE_INFO_REGISTER, MISSED_DATA_REGISTER, NUMBER_ALREADY_EXIST, PHONENUMBER_OR_PASSWORD_FAILED, SUCCESS_LOGOUT, SUCCESS_REQUEST, THIS_NUMBER_NOT_VERIFIED_BY_OTP, USER_NOT_FOUND, USER_NOT_FOUND_LOGIN } from "../validators/messagesResponse.js";

/**
 * تسجيل مستخدم جديد مع تحديد الدولة من رقم الهاتف
 */
export const registerUser = async (phone, password, name, birthDate, sex, avatarUrl, req) => {
  try {
    // التحقق من الحقول المطلوبة
    if (!phone || !sex || !name || !birthDate || !password) {
      throw new Error(MISSED_DATA_REGISTER);
    }
    // التحقق من وجود المستخدم
    const exists = await UserModel.findByPhone(phone);
    if (exists) throw new Error(NUMBER_ALREADY_EXIST);

    // التحقق من OTP
    const otp = await OtpCodeModel.findForVerifeidNumber(phone);
    if (!otp) throw new Error(THIS_NUMBER_NOT_VERIFIED_BY_OTP);

    // تحليل رقم الهاتف لاستخراج معلومات الدولة
    const phoneInfo = getCountryFromPhone(phone);
    let country = null;
    let countryCode = null;

    if (phoneInfo.success) {
      country = phoneInfo.countryName;
      countryCode = phoneInfo.countryCode;

      // تحديث رقم الهاتف إلى التنسيق الدولي الصحيح
      phone = phoneInfo.phone;
    } else {
      console.warn(`Could not detect country for phone ${phone}:`, phoneInfo.error);
    }

    // تشفير كلمة المرور
    const passwordHash = await hashPassword(password);

    // إنشاء المستخدم
    const user = await UserModel.createUser({
      phone,
      passwordHash,
      name,
      sex,
      birthDate: new Date(birthDate),
      avatarUrl: avatarUrl || null,
      country,
      countryCode,
      isVerified: true,
      isActive: true
    });

    // إنشاء جلسة أولى
    const realIp = getRealIP(req);
    const userAgent = req.headers["user-agent"];

    const session = await SessionModel.createSession({
      userId: user.id,
      userAgent,
      ip: req.ip,
      realIp
    });

    // تحديث الجلسة بمعلومات الموقع والجهاز بشكل غير متزامن
    updateSessionWithIPInfo(session.id, realIp, userAgent).catch(() => { });

    // تحديث معرف الجلسة الحالية
    await UserModel.updateById(user.id, { currentSessionId: session.id });

    // إلغاء جميع الجلسات الأخرى للمستخدم فوراً
    await SessionModel.revokeOtherSessions(user.id, session.id);

    // إنشاء التوكنات
    const tokens = await generateTokenPair(user.id, session.id, user.role);

    // إلغاء جميع Refresh Tokens الأخرى للمستخدم للحفاظ على جلسة واحدة فعّالة فقط
    await revokeUserRefreshTokensExceptSession(user.id, session.id);

    // تسجيل محاولة تسجيل ناجحة
    await rateLimiter.recordSuccessfulAttempt(phone, realIp, userAgent, user.id);

    const { passwordHash: _, isVerified: __, ...safeUser } = user;
    return {
      user: safeUser,
      isVerified: user.isVerified,
      isAlreadyVerified: SUCCESS_REQUEST,
      ...tokens,
      phoneInfo: phoneInfo.success ? {
        country: phoneInfo.country,
        countryName: phoneInfo.countryName,
        countryCode: phoneInfo.countryCode,
        type: phoneInfo.type
      } : null
    };

  } catch (error) {
    // تسجيل محاولة فاشلة
    const realIp = getRealIP(req);
    const userAgent = req.headers["user-agent"];
    await rateLimiter.recordFailedAttempt(phone, realIp, userAgent, null, error.message);

    throw error;
  }
};

/**
 * تسجيل دخول المستخدم مع حماية من هجمات القوة الغاشمة
 */
export const loginUser = async (phone, password, req) => {
  const realIp = getRealIP(req);
  const userAgent = req.headers["user-agent"];

  try {
    // التحقق من rate limiting
    // const canAttempt = await rateLimiter.canAttempt(phone);
    // if (!canAttempt) {
    //   const attemptInfo = rateLimiter.getAttemptInfo(phone);
    //   const retryAfterSeconds = Math.max(1, Math.ceil(attemptInfo.timeUntilReset / 1000));
    //   const timeLeftMin = Math.ceil(retryAfterSeconds / 60);
    //   const err = new Error(`تم قفل الحساب مؤقتاً. حاول مرة أخرى بعد ${timeLeftMin} دقيقة`);
    //   err.code = 'ACCOUNT_LOCKED';
    //   err.retryAfterSeconds = retryAfterSeconds;
    //   // سجل محاولة فاشلة بسبب قفل الحساب
    //   await rateLimiter.recordFailedAttempt(phone, realIp, userAgent, null, ACCOUNT_LOCKED_LOGIN);
    //   throw err;
    // }

    // البحث عن المستخدم
    const user = await UserModel.findByPhone(phone);

    if (!user) {
      await rateLimiter.recordFailedAttempt(phone, realIp, userAgent, null, USER_NOT_FOUND_LOGIN);
      throw new Error(PHONENUMBER_OR_PASSWORD_FAILED);
    }

        // التحقق من حالة المستخدم
    if (!user?.isVerified) {
      await rateLimiter.recordFailedAttempt(phone, realIp, userAgent, user.id, THIS_NUMBER_NOT_VERIFIED_BY_OTP);
      throw new Error(THIS_NUMBER_NOT_VERIFIED_BY_OTP);
    }

    if (!user.isActive) {
      await rateLimiter.recordFailedAttempt(phone, realIp, userAgent, user.id, IN_ACTIVE_ACCOUNT);
      throw new Error(IN_ACTIVE_ACCOUNT);
    }

    // التحقق من كلمة المرور
    const passwordValid = await comparePassword(password, user.passwordHash);
    if (!passwordValid) {
      await rateLimiter.recordFailedAttempt(phone, realIp, userAgent, user.id, PHONENUMBER_OR_PASSWORD_FAILED);
      throw new Error(PHONENUMBER_OR_PASSWORD_FAILED);
    }

    // إنشاء جلسة جديدة
    const session = await SessionModel.createSession({
      userId: user.id,
      userAgent,
      ip: req.ip,
      realIp
    });

    // تحديث معرف الجلسة الحالية
    await UserModel.updateById(user.id, { currentSessionId: session.id });

    // إنشاء التوكنات
    const tokens = await generateTokenPair(user.id, session.id, user.role);

    // تسجيل محاولة ناجحة
    await rateLimiter.recordSuccessfulAttempt(phone, realIp, userAgent, user.id);

    // إلغاء جميع Refresh Tokens الأخرى للمستخدم للحفاظ على جلسة واحدة فعّالة فقط
    await revokeUserRefreshTokensExceptSession(user.id, session.id);

    const { passwordHash: _, isVerified: __, ...safeUser } = user;
    return {
      user: safeUser,
      isVerified: user.isVerified,
      isAlreadyVerified: SUCCESS_REQUEST,
      ...tokens
    };

  } catch (error) {
    // تسجيل محاولة فاشلة إذا لم تكن مسجلة مسبقاً
    if (!error.message) {
      await rateLimiter.recordFailedAttempt(phone, realIp, userAgent, null, 'UNKNOWN_ERROR');
    }
    throw error;
  }
};

/**
 * تجديد access token
 */
export const refreshToken = async (refreshToken) => {
  try {
    return await refreshAccessToken(refreshToken);
  } catch (error) {
    throw new Error(FALIURE_REFERESH_TOKEN);
  }
};

/**
 * تسجيل خروج المستخدم
 */
// export const logoutUser = async (userId, sessionId, refreshToken) => {
export const logoutUser = async (userId) => {
  try {
    // // إلغاء الجلسة
    // await SessionModel.revokeSessionById(sessionId);

    // // مسح معرف الجلسة الحالية من المستخدم
    // await UserModel.updateById(userId, { currentSessionId: null });

    // // إلغاء refresh token
    // if (refreshToken) {
    //   await revokeRefreshToken(refreshToken);
    // }

    // إلغاء جميع الجلسات
    await SessionModel.revokeAllSessions(userId);

    // مسح معرف الجلسة الحالية
    await UserModel.updateById(userId, { currentSessionId: null });

    // إلغاء جميع refresh tokens
    await revokeAllUserRefreshTokens(userId);

    return { success: SUCCESS_REQUEST, message: SUCCESS_LOGOUT };
  } catch (error) {
    throw new Error(FAILURE_LOGOUT);
  }
};

/**
 * تسجيل خروج من جميع الأجهزة
 */
export const logoutAllDevices = async (userId) => {
  try {
    // إلغاء جميع الجلسات
    await SessionModel.revokeAllSessions(userId);

    // مسح معرف الجلسة الحالية
    await UserModel.updateById(userId, { currentSessionId: null });

    // إلغاء جميع refresh tokens
    await revokeAllUserRefreshTokens(userId);

    return { success: true, message: "تم تسجيل الخروج من جميع الأجهزة" };
  } catch (error) {
    throw new Error("فشل في تسجيل الخروج من جميع الأجهزة");
  }
};

/**
 * الحصول على معلومات الجلسات النشطة
 */
export const getActiveSessions = async (userId) => {
  try {
    return await SessionModel.findActiveSessionsByUser(userId);
  } catch (error) {
    throw new Error("فشل في جلب الجلسات النشطة");
  }
};

/**
 * إلغاء جلسة محددة
 */
export const revokeSession = async (userId, sessionId) => {
  try {
    const session = await SessionModel.findById(sessionId);
    if (!session || session.userId !== userId) throw new Error("الجلسة غير موجودة");

    await SessionModel.revokeSessionById(sessionId);

    const user = await UserModel.findById(userId);
    if (user.currentSessionId === sessionId) {
      await UserModel.updateById(user.id, { currentSessionId: null });
    }
    return { success: true, message: "تم إلغاء الجلسة بنجاح" };
  } catch (error) {
    throw error;
  }
};


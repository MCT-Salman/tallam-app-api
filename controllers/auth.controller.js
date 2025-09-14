// ملاحظة: تم الاعتماد على UserModel/SessionModel بدلاً من prisma مباشرة في هذا الكونترولر
import { serializeResponse } from "../utils/serialize.js";
import {
  registerUser,
  loginUser,
  refreshToken as refreshAccessTokenService,
  logoutUser,
  logoutAllDevices,
  getActiveSessions,
  revokeSession
} from "../services/auth.service.js";
import { sendOtp, verifyOtp } from "../services/otp.service.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generatePasswordResetToken, verifyPasswordResetToken, generateTokenPair, revokeAllUserRefreshTokens, revokeUserRefreshTokensExceptSession } from "../utils/jwt.js";
import { getRealIP } from "../utils/ip.js";
import { UserModel, SessionModel, OtpCodeModel } from "../models/index.js";
import { BAD_REQUEST_STATUS_CODE, SUCCESS_CREATE_STATUS_CODE, SUCCESS_STATUS_CODE } from "../validators/statusCode.js";
import { CHANGE_PASSWORD_SUCCESSFULLY, CURRENT_PASSWORD_NOT_CORRECT_PROFILE, CURRENT_PASSWORD_REQUIRED_TO_CHANGE_FROM_PROFILE, FAILURE_REQUEST, OTP_SUCCESS_VERIFY, PHONE_NUMBER_REQUIRED, REFERESH_TOKEN_REQUIRED, SUCCESS_LOGIN, SUCCESS_REFERESH_TOKEN, SUCCESS_REGISTER, SUCCESS_REQUEST, UPDATE_PROFILE_INFO_SUCCESSFULLY, USER_NOT_FOUND_FORGET, USER_NOT_FOUND_PROFILE } from "../validators/messagesResponse.js";

/**
 * تسجيل مستخدم جديد
 */
export const register = async (req, res, next) => {
  try {
    
    const { phone, password, name, birthDate, sex } = req.body;
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    const result = await registerUser(phone, password, name, birthDate, sex, avatarUrl, req);

    res.status(SUCCESS_CREATE_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: SUCCESS_REGISTER,
      data: {
        ...serializeResponse(result)
      }
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    return next(error);
  }
};

/**
 * طلب OTP لنسيت كلمة المرور
 */
export const forgotRequestOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    // if (!phone) return res.status(BAD_REQUEST_STATUS_CODE).json({ success: FAILURE_REQUEST, message: PHONE_NUMBER_REQUIRED });

    const user = await UserModel.findByPhone(phone);
    if (!user) return res.status(BAD_REQUEST_STATUS_CODE).json({ success: FAILURE_REQUEST, message: USER_NOT_FOUND_FORGET, data: {} });

    await OtpCodeModel.markOtpUnUsed(phone);
    const result = await sendOtp(phone);
    res.json({
      success: SUCCESS_REQUEST,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    return next(error);
  }
};

/**
 * التحقق من OTP وإصدار reset token قصير الأجل
 */
export const forgotVerifyOtp = async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    // if (!phone || !code) return res.status(400).json({ success: false, message: "الهاتف والرمز مطلوبان" });

    await verifyOtp(phone, code);

    const user = await UserModel.findByPhone(phone, { id: true });
    if (!user) return res.status(BAD_REQUEST_STATUS_CODE).json({ success: FAILURE_REQUEST, message: USER_NOT_FOUND_FORGET, data: {} });

    await OtpCodeModel.markOtpUsedByPhone(phone);
    const resetToken = generatePasswordResetToken({ id: user.id, phone });
    res.json({
      success: SUCCESS_REQUEST,
      message: OTP_SUCCESS_VERIFY,
      data: {
        resetToken
      }
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    return next(error);
  }
};

/**
 * إعادة تعيين كلمة المرور باستخدام reset token
 * بعد النجاح: إلغاء كل الجلسات والتوكنات السابقة وإنشاء جلسة جديدة وتوكنات جديدة (تسجيل دخول تلقائي)
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    // if (!resetToken || !newPassword) {
    //   return res.status(400).json({ success: false, message: "resetToken وكلمة المرور الجديدة مطلوبة" });
    // } 

    const decoded = verifyPasswordResetToken(resetToken);
    const userId = decoded.id;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(BAD_REQUEST_STATUS_CODE).json({ success: FAILURE_REQUEST, message: USER_NOT_FOUND_FORGET, data: {} });

    const passwordHash = await hashPassword(newPassword);
    await UserModel.updateById(userId, { passwordHash });

    // إلغاء جميع الجلسات والتوكنات السابقة
    await SessionModel.revokeAllSessions(userId);
    await UserModel.updateById(userId, { currentSessionId: null });
    await revokeAllUserRefreshTokens(userId);

    // إنشاء جلسة جديدة وتسجيل دخول تلقائي
    const realIp = getRealIP(req);
    const userAgent = req.headers["user-agent"];
    const session = await SessionModel.createSession({ userId, userAgent, ip: req.ip, realIp });
    await UserModel.updateById(userId, { currentSessionId: session.id });
    const tokens = await generateTokenPair(userId, session.id, user.role);

    // ضمان إلغاء أي Refresh Tokens لأية جلسات أخرى (احترازي)
    await revokeUserRefreshTokensExceptSession(userId, session.id);

    res.json({
      success: SUCCESS_REQUEST,
      message: CHANGE_PASSWORD_SUCCESSFULLY,
      isAlreadyVerified: SUCCESS_REQUEST,
      data: {
        ...serializeResponse({ user: { id: user.id, phone: user.phone, name: user.name, role: user.role }, ...tokens })
      }
    });
  } catch (error) {
    res.status(BAD_REQUEST_STATUS_CODE).json({ success: FAILURE_REQUEST, message: error.message, data: {} });
  }
};

/**
 * تسجيل دخول المستخدم
 */
export const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    const result = await loginUser(phone, password, req);
      res.json({
        success: SUCCESS_REQUEST,
        message: SUCCESS_LOGIN,
        data: {
          ...serializeResponse(result)
        }
      });
  } catch (error) {
    if (error.code === 'ACCOUNT_LOCKED') {
      error.statusCode = 429;
    } else {
      error.statusCode = error.statusCode || 401;
    }
    return next(error);
  }
};

/**
 * تجديد access token
 */
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const result = await refreshAccessTokenService(refreshToken);

    res.json({
      success: SUCCESS_REQUEST,
      message: SUCCESS_REFERESH_TOKEN,
      data: {
        ...serializeResponse(result)
      }
    });
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    return next(error);
  }
};

/**
 * تسجيل خروج المستخدم
 */
export const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await logoutUser(userId);

    res.json({
      success: SUCCESS_REQUEST,
      message: result.message,
      data: {}
    });
  } catch (error) {
    res.status(BAD_REQUEST_STATUS_CODE).json({
      success: FAILURE_REQUEST,
      message: error.message,
      data: {}
    });
  }
  // try {
  //   const { refreshToken } = req.body;
  //   const userId = req.user.id;
  //   const sessionId = req.user.sessionId; // من middleware

  //   const result = await logoutUser(userId, sessionId, refreshToken);

  //   res.json({
  //     success: true,
  //     data: {
  //       message: result.message
  //     }
  //   });
  // } catch (error) {
  //   error.statusCode = error.statusCode || 400;
  //   return next(error);
  // }
};

/**
 * تسجيل خروج من جميع الأجهزة
 */
export const logoutAll = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await logoutAllDevices(userId);

    res.json({
      success: true,
      message: result.message,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: {}
    });
  }
};

/**
 * الحصول على الجلسات النشطة
 */
export const getSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sessions = await getActiveSessions(userId);

    res.json({
      success: true,
      data: {
        ...serializeResponse(sessions)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: {}
    });
  }
};

/**
 * إلغاء جلسة محددة
 */
export const revokeSessionById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    const result = await revokeSession(userId, sessionId);

    res.json({
      success: true,
      message: result.message,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: {}
    });
  }
};

/**
 * الحصول على معلومات المستخدم الحالي
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await UserModel.findById(userId, {
      id: true,
      phone: true,
      name: true,
      birthDate: true,
      avatarUrl: true,
      role: true,
      sex: true,
      country: true,
      countryCode: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    });

    if (!user) {
      return res.status(BAD_REQUEST_STATUS_CODE).json({
        success: FAILURE_REQUEST,
        message: USER_NOT_FOUND_PROFILE,
        data: {}
      });
    }

    res.json({
      success: SUCCESS_REQUEST,
      data: {
        ...serializeResponse(user)
      }
    });
  } catch (error) {
    res.status(BAD_REQUEST_STATUS_CODE).json({
      success: FAILURE_REQUEST,
      message: error.message,
      data: {}
    });
  }
};

/**
 * تحديث معلومات المستخدم
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, birthDate, sex, currentPassword, newPassword } = req.body;
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

    const updateData = {};
    if (name) updateData.name = name;
    if (birthDate) updateData.birthDate = new Date(birthDate);
    if (sex) updateData.sex = sex;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;

    // تغيير كلمة المرور من داخل تحديث الملف الشخصي: يتطلب إدخال الكلمة الحالية
    if (newPassword) {
      if (!currentPassword) {
        return res.status(BAD_REQUEST_STATUS_CODE).json({ success: FAILURE_REQUEST, message: CURRENT_PASSWORD_REQUIRED_TO_CHANGE_FROM_PROFILE, data: {} });
      }

      const userForPwd = await UserModel.findById(userId, { passwordHash: true });
      if (!userForPwd) {
        return res.status(BAD_REQUEST_STATUS_CODE).json({ success: FAILURE_REQUEST, message: USER_NOT_FOUND_PROFILE, data: {} });
      }

      const ok = await comparePassword(currentPassword, userForPwd.passwordHash);
      if (!ok) {
        return res.status(401).json({ success: FAILURE_REQUEST, message: CURRENT_PASSWORD_NOT_CORRECT_PROFILE, data: {} });
      }

      const newHash = await hashPassword(newPassword);
      updateData.passwordHash = newHash;
    }

    const user = await UserModel.updateById(
      userId,
      updateData,
      {
        id: true,
        phone: true,
        name: true,
        birthDate: true,
        avatarUrl: true,
        role: true,
        sex: true,
        country: true,
        countryCode: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    );

    // في حال تغيير كلمة المرور: إلغاء كل الجلسات الأخرى والتوكنات السابقة وإبقاء الجلسة الحالية فقط
    if (newPassword) {
      const currentSessionId = req.user.sessionId || null;
      if (currentSessionId) {
        await SessionModel.revokeOtherSessions(userId, currentSessionId);
      } else {
        // إن لم نعرف الجلسة الحالية، ألغِ كل الجلسات للاحتياط
        await SessionModel.revokeAllSessions(userId);
      }
      // إلغاء كل Refresh Tokens الأخرى والإبقاء على الحالية عبر الـ sid إن توفّر
      try {
        if (currentSessionId) {
          await revokeUserRefreshTokensExceptSession(userId, currentSessionId);
        } else {
          await revokeAllUserRefreshTokens(userId);
        }
      } catch (_) { }
    }

    res.json({
      success: SUCCESS_REQUEST,
      message: UPDATE_PROFILE_INFO_SUCCESSFULLY,
      data: {
        ...serializeResponse(user)
      }
    });
  } catch (error) {
    res.status(BAD_REQUEST_STATUS_CODE).json({
      success: FAILURE_REQUEST,
      message: error.message,
      data: {}
    });
  }
};


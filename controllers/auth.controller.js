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
import { generatePasswordResetToken, generateTokenPair, revokeAllUserRefreshTokens, revokeUserRefreshTokensExceptSession } from "../utils/jwt.js";
import { getRealIP } from "../utils/ip.js";
import { UserModel, SessionModel, OtpCodeModel } from "../models/index.js";
import { BAD_REQUEST_STATUS_CODE, SUCCESS_CREATE_STATUS_CODE, SUCCESS_STATUS_CODE } from "../validators/statusCode.js";
import { FAILURE_REQUEST, OTP_SUCCESS_VERIFY, PHONE_NUMBER_REQUIRED, REFERESH_TOKEN_REQUIRED, SUCCESS_LOGIN, SUCCESS_REFERESH_TOKEN, SUCCESS_REGISTER, SUCCESS_REQUEST, UPDATE_PROFILE_INFO_SUCCESSFULLY, USER_NOT_FOUND_FORGET, USER_NOT_FOUND_PROFILE } from "../validators/messagesResponse.js";

/** 
 * تسجيل مستخدم جديد
 */
export const register = async (req, res, next) => {
  try {
    console.log(req.body);
    const { phone, name, birthDate, sex } = req.body;
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    const result = await registerUser(phone, name, birthDate, sex, avatarUrl, req);

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
 * تسجيل دخول المستخدم
 */
export const login = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const result = await loginUser(phone, req);
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
    // const userId = parseInt(req.user.id);
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
      message:"تم جلب البيانات بنجاح",
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
    const { name, birthDate, sex } = req.body;
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

    const updateData = {};
    if (name) updateData.name = name;
    if (birthDate) updateData.birthDate = new Date(birthDate);
    if (sex) updateData.sex = sex;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;

 
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


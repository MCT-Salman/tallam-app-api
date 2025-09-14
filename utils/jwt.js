import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../prisma/client.js";
import { RefreshTokenModel } from "../models/index.js";
import { TOKEN_NOT_CORRECT } from "../validators/messagesResponse.js";

const JWT_SECRET = process.env.JWT_SECRET ;
const REFRESH_SECRET = process.env.REFRESH_SECRET ;
const PASSWORD_RESET_SECRET = process.env.PASSWORD_RESET_SECRET;

// مدد صلاحية التوكنات من المتغيرات البيئية
// أمثلة: "15m", "1h", "7d"
// نجعل access token قصير العمر، ونحافظ على الجلسة عبر refresh token طويل العمر
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRES_IN || "5m";
// لجعل الجلسة لا تنتهي إلا عند تسجيل الخروج، نجعل مدة طويلة جداً بشكل افتراضي (10 سنوات)
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRES_IN || "10m";
// توكن إعادة تعيين كلمة المرور قصير الأجل
const RESET_TOKEN_EXPIRY = process.env.PASSWORD_RESET_EXPIRES_IN || "10m";

// تحويل صيغ المدة (s, m, h, d) إلى ميلي ثانية
const durationToMs = (str) => {
  if (!str || typeof str !== 'string') return 0;
  const match = str.trim().match(/^(\d+)\s*([smhd])$/i);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * (multipliers[unit] || 0);
};

/**
 * إنشاء access token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

/**
 * إنشاء refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

/**
 * التحقق من access token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * التحقق من refresh token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

/**
 * إنشاء توكن إعادة تعيين كلمة المرور (قصير الأجل)
 */
export const generatePasswordResetToken = (payload) => {
  return jwt.sign({ ...payload, type: 'pwd_reset' }, PASSWORD_RESET_SECRET, { expiresIn: RESET_TOKEN_EXPIRY });
};

/**
 * التحقق من توكن إعادة تعيين كلمة المرور
 */
export const verifyPasswordResetToken = (token) => {
  const decoded = jwt.verify(token, PASSWORD_RESET_SECRET);
  if (decoded.type !== 'pwd_reset') throw new Error(TOKEN_NOT_CORRECT);
  return decoded;
};

/**
 * إنشاء زوج من التوكنات (access + refresh)
 */
export const generateTokenPair = async (userId, sessionId, role) => {
  const payload = {
    id: userId,
    sid: sessionId,
    role: role
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ 
    id: userId, 
    sid: sessionId,
    type: 'refresh'
  });

  // تخزين refresh token في قاعدة البيانات
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const refreshMs = durationToMs(REFRESH_TOKEN_EXPIRY) || (7 * 24 * 60 * 60 * 1000);

  await RefreshTokenModel.createRefreshToken({
    tokenHash: refreshTokenHash,
    userId: userId,
    sessionId: sessionId,
    expiresAt: new Date(Date.now() + refreshMs),
    createdAt: new Date()
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: Math.floor((durationToMs(ACCESS_TOKEN_EXPIRY) || (15 * 60 * 1000)) / 1000)
  };
};

/**
 * تجديد access token باستخدام refresh token
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    // التحقق من صحة refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      throw new Error(TOKEN_NOT_CORRECT);
    }

    // التحقق من وجود refresh token في قاعدة البيانات
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash: refreshTokenHash,
        userId: decoded.id,
        sessionId: decoded.sid,
        isRevoked: false,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!storedToken) {
      throw new Error('Refresh token not found or expired');
    }

    // التحقق من أن الجلسة ما زالت نشطة
    const session = await prisma.session.findUnique({
      where: { id: decoded.sid },
      include: { user: true }
    });

    if (!session || session.revokedAt) {
      throw new Error('Session is not active');
    }

    // تدوير (تجديد) refresh token: إلغاء الحالي وإنشاء آخر جديد لنفس الجلسة
    const newRefreshToken = generateRefreshToken({
      id: decoded.id,
      sid: decoded.sid,
      type: 'refresh'
    });
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const refreshMs = durationToMs(REFRESH_TOKEN_EXPIRY) || (7 * 24 * 60 * 60 * 1000);

    // إلغاء الحالي
    await prisma.refreshToken.update({ where: { id: storedToken.id }, data: { isRevoked: true, revokedAt: new Date() } });

    // إنشاء سجل جديد
    await RefreshTokenModel.createRefreshToken({
      tokenHash: newRefreshTokenHash,
      userId: decoded.id,
      sessionId: decoded.sid,
      expiresAt: new Date(Date.now() + refreshMs),
      createdAt: new Date()
    });

    // إنشاء access token جديد
    const newAccessToken = generateAccessToken({
      id: storedToken.userId,
      sid: decoded.sid,
      role: session.user.role
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: Math.floor((durationToMs(ACCESS_TOKEN_EXPIRY) || (15 * 60 * 1000)) / 1000)
    };
 
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * إلغاء refresh token
 */
export const revokeRefreshToken = async (refreshToken) => {
  try {
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await RefreshTokenModel.revokeRefreshTokenByHash(refreshTokenHash);

    return true;
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    return false;
  }
};

/**
 * إلغاء جميع refresh tokens للمستخدم
 */
export const revokeAllUserRefreshTokens = async (userId) => {
  try {
    await RefreshTokenModel.revokeAllUserTokens(userId);

    return true;
  } catch (error) {
    console.error('Error revoking user refresh tokens:', error);
    return false;
  }
};

/**
 * إلغاء جميع refresh tokens للمستخدم باستثناء جلسة محددة
 */
export const revokeUserRefreshTokensExceptSession = async (userId, sessionId) => {
  try {
    await RefreshTokenModel.revokeUserTokensExceptSession(userId, sessionId);
    return true;
  } catch (error) {
    console.error('Error revoking user refresh tokens except session:', error);
    return false;
  }
};

/**
 * تنظيف refresh tokens المنتهية الصلاحية
 */
export const cleanupExpiredTokens = async () => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true, revokedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // حذف المُلغاة بعد 24 ساعة
        ]
      }
    });

    console.log(`Cleaned up ${result.count} expired refresh tokens`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    return 0;
  }
};

// تنظيف دوري كل ساعة
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);


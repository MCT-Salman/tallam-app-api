import prisma from "../prisma/client.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { getRealIP } from "../utils/ip.js";
import { ACCOUNT_EXPIRED, CANCELD_SESSION, FAILURE_REQUEST, IN_ACTIVE_ACCOUNT, NO_AUTH, NOT_VERIFIED, TOKEN_EXPIRED, TOKEN_NOT_CORRECT, USER_NOT_FOUND } from "../validators/messagesResponse.js";

/**
 * Middleware للتحقق من المصادقة
 */
export const requireAuth = async (req, res, next) => {
  const hdr = req.headers.authorization;

  if (!hdr?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: FAILURE_REQUEST,
      message: NO_AUTH,
      data: {}
    });
  }

  try {
    const token = hdr.slice(7);
    const payload = verifyAccessToken(token);
console.log("before user");
    // التحقق من وجود المستخدم
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        role: true,
        isActive: true,
        isVerified: true,
        currentSessionId: true,
        expiresAt: true
      }
    });

    console.log("after user");

    if (!user) {
      return res.status(401).json({
        success: FAILURE_REQUEST,
        message: USER_NOT_FOUND,
        data: {}
      });
    }

    // التحقق من حالة المستخدم
    if (!user.isActive) {
      return res.status(401).json({
        success: FAILURE_REQUEST,
        message: IN_ACTIVE_ACCOUNT,
        data: {}
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: FAILURE_REQUEST,
        message: NOT_VERIFIED,
        data: {}
      });
    }

    

    // التحقق من الجلسة
    if (!user.currentSessionId || user.currentSessionId !== payload.sid) {
      return res.status(401).json({
        success: FAILURE_REQUEST,
        message: CANCELD_SESSION,
        data: {}
      });
    }
    

    // التحقق من تاريخ انتهاء صلاحية الحساب (للمدراء الفرعيين مثلاً)
    if (user.expiresAt && new Date() > new Date(user.expiresAt)) {
      return res.status(401).json({
        success: FAILURE_REQUEST,
        message: ACCOUNT_EXPIRED,
        code: 'ACCOUNT_EXPIRED',
        data: {}
      });
    }

    

    // التحقق من صحة الجلسة في قاعدة البيانات
    const session = await prisma.session.findUnique({
      where: { id: payload.sid },
      select: {
        id: true,
        userId: true,
        revokedAt: true,
        realIp: true,
        userAgent: true
      }
    });

    if (!session || session.revokedAt || session.userId !== user.id) {
      return res.status(401).json({
        success: FAILURE_REQUEST,
        message: CANCELD_SESSION,
        data: {}
      });
    }

    // إضافة معلومات المستخدم والجلسة إلى الطلب
    req.user = {
      id: user.id,
      role: user.role,
      sessionId: session.id
    };

    // تحديث معلومات الجلسة إذا تغيرت
    const currentRealIp = getRealIP(req);
    const currentUserAgent = req.headers["user-agent"];

    if (session.realIp !== currentRealIp || session.userAgent !== currentUserAgent) {
      // تحديث معلومات الجلسة (اختياري - قد تريد تسجيل تحذير بدلاً من ذلك)
      await prisma.session.update({
        where: { id: session.id },
        data: {
          realIp: currentRealIp,
          userAgent: currentUserAgent
        }
      });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: FAILURE_REQUEST,
        message: TOKEN_EXPIRED,
        data: {
          code: "TOKEN_EXPIRED"
        }
      });
    }

    return res.status(401).json({
      success: FAILURE_REQUEST,
      message: TOKEN_NOT_CORRECT,
      data: {}
    });
  }
};

/**
 * Middleware للتحقق من الصلاحيات
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: FAILURE_REQUEST,
        message: NO_AUTH,
        data: {}
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: FAILURE_REQUEST,
        message: NO_AUTH,
        data: {}
      });
    }

    next();
  };
};

/**
 * Middleware للتحقق من صلاحية الإدارة
 */
export const requireAdmin = requireRole(['ADMIN', 'SUBADMIN']);

/**
 * Middleware للتحقق من صلاحية الإدارة الرئيسية فقط
 */
export const requireMainAdmin = requireRole(['ADMIN']);

/**
 * Middleware اختياري للمصادقة (لا يرفض الطلب إذا لم يكن مصادق عليه)
 */
export const optionalAuth = async (req, res, next) => {
  const hdr = req.headers.authorization;

  if (!hdr?.startsWith("Bearer ")) {
    return next(); // المتابعة بدون مصادقة
  }

  try {
    const token = hdr.slice(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        role: true,
        isActive: true,
        isVerified: true,
        currentSessionId: true
      }
    });

    if (user && user.isActive && user.isVerified && user.currentSessionId === payload.sid) {
      const session = await prisma.session.findUnique({
        where: { id: payload.sid },
        select: {
          id: true,
          userId: true,
          revokedAt: true
        }
      });

      if (session && !session.revokedAt && session.userId === user.id) {
        req.user = {
          id: user.id,
          role: user.role,
          sessionId: session.id
        };
      }
    }
  } catch (error) {
    // تجاهل الأخطاء في المصادقة الاختيارية
  }

  next();
};

/**
 * Middleware لتسجيل معلومات الطلب
 */
export const logRequest = (req, res, next) => {
  const realIp = getRealIP(req);
  const userAgent = req.headers["user-agent"];
  const method = req.method;
  const url = req.originalUrl;
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ${method} ${url} - IP: ${realIp} - UA: ${userAgent}`);

  // إضافة معلومات الطلب للاستخدام في controllers
  req.requestInfo = {
    realIp,
    userAgent,
    method,
    url,
    timestamp
  };

  next();
};

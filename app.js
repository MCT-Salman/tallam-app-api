import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { xssSanitizer } from "./middlewares/xss.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

// تحميل متغيرات البيئة
config();

// إعداد __dirname للـ ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// استيراد المسارات
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import otpRoutes from './routes/otp.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import userRoutes from './routes/user.routes.js';
import codeRequestRoutes from './routes/codeRequest.routes.js';
import accessCodeRoutes from './routes/accessCode.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import studentQuizRoutes from './routes/quiz.public.routes.js';
import progressRoutes from './routes/progress.routes.js';
import lessonRoutes from './routes/lesson.routes.js';

const app = express();
// تفعيل الثقة بالـ Proxy (فعّلها عند التشغيل خلف Nginx/Cloudflare/Load Balancer)
// ملاحظة: عندما تكون خلف بروكسي واحد (مثل Nginx أمام التطبيق مباشرة) يمكنك استخدام الرقم 1
// app.set('trust proxy', true);
// app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// إعداد Rate Limiting العام
// const generalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 دقيقة
//   max: 100, // الحد الأقصى 100 طلب لكل IP
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res /*, next, options */) => {
//     const resetTime = req.rateLimit?.resetTime instanceof Date ? req.rateLimit.resetTime.getTime() : null;
//     const now = Date.now();
//     const retryAfterSeconds = resetTime ? Math.max(1, Math.ceil((resetTime - now) / 1000)) : undefined;
//     const waitMin = retryAfterSeconds ? Math.ceil(retryAfterSeconds / 60) : undefined;
//     return res.status(429).json({
//       success: false,
//       error: 'تم تجاوز الحد الأقصى للطلبات، حاول مرة أخرى لاحقاً',
//       ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
//       ...(retryAfterSeconds ? { waitMessage: waitMin >= 1 ? `يرجى الانتظار حوالي ${waitMin} دقيقة قبل المحاولة مجدداً` : `يرجى الانتظار ${retryAfterSeconds} ثانية قبل المحاولة مجدداً` } : {})
//     });
//   }
// });

// إعداد Rate Limiting للمصادقة
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 دقيقة
//   max: 10, // الحد الأقصى 10 محاولات تسجيل دخول لكل IP
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res /*, next, options */) => {
//     const resetTime = req.rateLimit?.resetTime instanceof Date ? req.rateLimit.resetTime.getTime() : null;
//     const now = Date.now();
//     const retryAfterSeconds = resetTime ? Math.max(1, Math.ceil((resetTime - now) / 1000)) : undefined;
//     const waitMin = retryAfterSeconds ? Math.ceil(retryAfterSeconds / 60) : undefined;
//     return res.status(429).json({
//       success: false,
//       error: 'تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول',
//       ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
//       ...(retryAfterSeconds ? { waitMessage: waitMin >= 1 ? `يرجى الانتظار حوالي ${waitMin} دقيقة قبل المحاولة مجدداً` : `يرجى الانتظار ${retryAfterSeconds} ثانية قبل المحاولة مجدداً` } : {})
//     });
//   }
// }); 

// Middleware الأساسي
app.use(helmet()); // حماية أمنية
app.use(compression()); // ضغط الاستجابات
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// تسجيل الطلبات
app.use(morgan('combined'));

// تطبيق Rate Limiting
// app.use(generalLimiter);

// معالجة JSON و URL encoding
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(xssSanitizer);
// خدمة الملفات الثابتة
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// توثيق OpenAPI (ملف JSON)
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Enhanced Backend API',
    version: '1.0.0',
    features: [
      'Enhanced Authentication with JWT',
      'Phone Number Country Detection',
      'Improved IP Tracking',
      'Rate Limiting Protection',
      'Session Management',
      'Refresh Token Support'
    ],
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      user: '/api/user',
      otp: '/api/otp',
      catalog: '/api/catalog'
    }
  });
});

// تطبيق المسارات
// لا نطبق authLimiter على جميع مسارات /api/auth حتى لا تتأثر مسارات مثل /profile
app.use('/api/auth', authRoutes);
//app.use('/api/admin', adminRoutes);
// app.use('/api/otp', authLimiter, otpRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/users', userRoutes);
app.use('/api/code-requests', codeRequestRoutes);
app.use('/api/access-codes', accessCodeRoutes);
app.use('/api/admin', quizRoutes); // Using /api/admin prefix for quiz management
app.use('/api/quizzes', studentQuizRoutes); // Routes for students to take quizzes
app.use('/api/progress', progressRoutes); // Routes for students to track progress
app.use('/api/catalog', catalogRoutes);
app.use('/api/lessons', lessonRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));
// معالجة الأخطاء 404
app.use( (req, res) => {
  res.status(404).json({
    success: false,
    error: 'المسار غير موجود',
    path: req.originalUrl
  });
});

// معالج أخطاء مركزي
app.use(errorHandler);

// معالجة الأخطاء العامة
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  // أخطاء التحقق من صحة البيانات
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'بيانات غير صالحة',
      details: error.message
    });
  }

  // أخطاء JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'رمز المصادقة غير صالح'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'انتهت صلاحية رمز المصادقة',
      code: 'TOKEN_EXPIRED'
    });
  }

  // أخطاء Prisma
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'البيانات موجودة مسبقاً'
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'البيانات غير موجودة'
    });
  }

  // أخطاء Multer (رفع الملفات)
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'حجم الملف كبير جداً'
    });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'نوع الملف غير مدعوم'
    });
  }

  // خطأ عام
  res.status(500).json({
    success: false,
    error: 'خطأ في الخادم',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

// بدء الخادم
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Enhanced Backend Server running on port ${PORT}`);
  console.log(`📱 Phone country detection enabled`);
  console.log(`🔒 Enhanced authentication active`);
  console.log(`🌐 IP tracking improved`);
  console.log(`⚡ Rate limiting enabled`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📖 API Documentation: http://localhost:${PORT}/`);
  }
});
 
export default app;

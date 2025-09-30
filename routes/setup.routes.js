import express from 'express';
import { UserModel } from '../models/index.js';
import prisma from '../prisma/client.js';
import { hashPassword } from '../utils/hash.js';

const router = express.Router();

/**
 * POST /api/setup/create-admin
 * إنشاء حساب أدمن جديد
 * Body: { name, phone, sex, country, countryCode, birthDate (optional) }
 */
router.post('/create-admin', async (req, res) => {
  try {
    const {
      name = 'admin',
      phone = '0987654323',
      sex = 'ذكر',
      country = 'Saudi Arabia',
      countryCode = '+966',
      birthDate
    } = req.body;

    // التحقق من البيانات الأساسية
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'الاسم ورقم الهاتف مطلوبان'
      });
    }

    // التحقق من عدم وجود المستخدم مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'رقم الهاتف مستخدم بالفعل'
      });
    }

    // إنشاء حساب الأدمن
    const user = await UserModel.createUser({
      phone,
      name,
      sex,
      birthDate: birthDate ? new Date(birthDate) : new Date(),
      avatarUrl: null,
      country,
      countryCode,
      role: 'ADMIN',
      isVerified: true,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء حساب الأدمن بنجاح',
      data: {
        userId: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating admin account:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء إنشاء حساب الأدمن',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/setup/set-admin-credentials
 * تعيين بيانات اعتماد الأدمن (username, email, password)
 * Body: { userId OR phone, username, email, password }
 */
router.post('/set-admin-credentials', async (req, res) => {
  try {
    const { userId, phone, username, email, password } = req.body;

    // التحقق من البيانات المطلوبة
    if ((!userId && !phone) || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'يجب تقديم (userId أو phone) و username و email و password'
      });
    }

    // البحث عن المستخدم
    const user = userId
      ? await prisma.user.findUnique({ where: { id: Number(userId) } })
      : await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود'
      });
    }

    // التحقق من أن المستخدم أدمن
    if (!['ADMIN', 'SUBADMIN'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'المستخدم ليس أدمن أو مساعد أدمن'
      });
    }

    // تشفير كلمة المرور
    const passwordHash = await hashPassword(password);

    // البحث عن سجل الأدمن الموجود
    const existingAdmin = await prisma.admin.findFirst({
      where: { userId: user.id }
    });

    let admin;
    if (existingAdmin) {
      // تحديث بيانات الأدمن الموجودة
      admin = await prisma.admin.update({
        where: { id: existingAdmin.id },
        data: { username, email, passwordHash }
      });
    } else {
      // إنشاء سجل أدمن جديد
      admin = await prisma.admin.create({
        data: {
          userId: user.id,
          username,
          email,
          passwordHash
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تعيين بيانات اعتماد الأدمن بنجاح',
      data: {
        adminId: admin.id,
        userId: user.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Error setting admin credentials:', error);
    
    // معالجة أخطاء التكرار (Unique constraint)
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'unknown';
      return res.status(409).json({
        success: false,
        error: `${field === 'email' ? 'البريد الإلكتروني' : field === 'username' ? 'اسم المستخدم' : 'الحقل'} مستخدم بالفعل`
      });
    }

    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء تعيين بيانات الاعتماد',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/setup/create-full-admin
 * إنشاء حساب أدمن كامل مع بيانات الاعتماد في خطوة واحدة
 * Body: { name, phone, sex, country, countryCode, username, email, password, birthDate (optional) }
 */
router.post('/create-full-admin', async (req, res) => {
  try {
    const {
      name = 'admin',
      phone = '0987654323',
      sex = 'ذكر',
      country = 'Saudi Arabia',
      countryCode = '+966',
      username,
      email,
      password,
      birthDate
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!name || !phone || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'جميع الحقول المطلوبة: name, phone, username, email, password'
      });
    }

    // التحقق من عدم وجود المستخدم مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'رقم الهاتف مستخدم بالفعل'
      });
    }

    // إنشاء حساب الأدمن
    const user = await UserModel.createUser({
      phone,
      name,
      sex,
      birthDate: birthDate ? new Date(birthDate) : new Date(),
      avatarUrl: null,
      country,
      countryCode,
      role: 'ADMIN',
      isVerified: true,
      isActive: true
    });

    // تشفير كلمة المرور
    const passwordHash = await hashPassword(password);

    // إنشاء سجل الأدمن
    const admin = await prisma.admin.create({
      data: {
        userId: user.id,
        username,
        email,
        passwordHash
      }
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء حساب الأدمن الكامل بنجاح',
      data: {
        userId: user.id,
        adminId: admin.id,
        name: user.name,
        phone: user.phone,
        username: admin.username,
        email: admin.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating full admin account:', error);
    
    // معالجة أخطاء التكرار
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'unknown';
      return res.status(409).json({
        success: false,
        error: `${field === 'email' ? 'البريد الإلكتروني' : field === 'username' ? 'اسم المستخدم' : field === 'phone' ? 'رقم الهاتف' : 'الحقل'} مستخدم بالفعل`
      });
    }

    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء إنشاء حساب الأدمن الكامل',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
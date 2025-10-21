import * as AccessCodeService from '../services/accessCode.service.js';
import { serializeResponse } from '../utils/serialize.js';
import prisma from "../prisma/client.js";
import {
  COURSE_NOT_FOUND,
  FAILURE_REQUEST,
  SUCCESS_REQUEST,
} from '../validators/messagesResponse.js';
import {
  BAD_REQUEST_STATUS_CODE, NOT_FOUND_STATUS_CODE, SUCCESS_CREATE_STATUS_CODE, SUCCESS_STATUS_CODE,
} from '../validators/statusCode.js';

// --- Admin Controllers ---
export const adminGenerateCodes = async (req, res, next) => {
  try {
    const { courseLevelId, userId, validityInMonths, couponId, amountPaid, notes } = req.body;
    const adminId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "يجب رفع صورة الإيصال (receiptImageUrl) لأنه حقل إجباري",
        data: {}
      });
    }

    const parsedCourseLevelId = courseLevelId ? parseInt(courseLevelId, 10) : null;
    const parsedUserId = userId ? parseInt(userId, 10) : null;

    // ✅ 1. التحقق من وجود كود لم ينتهِ بعد
    const existingActiveCode = await prisma.accessCode.findFirst({
      where: {
        usedBy: parsedUserId,
        courseLevelId: parsedCourseLevelId,
        expiresAt: {
          gt: new Date() // يعني أن الكود ما زال صالحًا (لم ينتهِ بعد)
        }
      },
    });

    if (existingActiveCode) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن إنشاء كود جديد، يوجد كود فعّال لنفس المستخدم في هذا المستوى (لم ينتهِ بعد).",
        data: {}
      });
    }

    // ✅ 2. إنشاء الكود الجديد لأن لا يوجد كود صالح حاليًا
    const receiptImageUrl = `/uploads/images/financial/${req.file.filename}`;

    const result = await AccessCodeService.generateAccessCodes({
      courseLevelId: parsedCourseLevelId,
      userId: parsedUserId,
      validityInMonths: validityInMonths ? parseInt(validityInMonths, 10) : null,
      issuedBy: adminId,
      couponId: couponId ? parseInt(couponId, 10) : null,
      amountPaid,
      receiptImageUrl,
      notes
    });

    res.json({
      success: true,
      message: `تم توليد الكود ${result.code} بنجاح.`,
      data: serializeResponse(result),
    });

  } catch (error) {
    if (error.message === COURSE_NOT_FOUND) {
      error.statusCode = NOT_FOUND_STATUS_CODE;
    } else {
      error.statusCode = BAD_REQUEST_STATUS_CODE;
    }
    next(error);
  }
};



export const adminGetAllCodes = async (req, res, next) => {
  try {
    const codes = await AccessCodeService.getAllAccessCodes();
    res.json({
      success: true,
      message: "تم جلب جميع أكواد الوصول بنجاح.",
      data: serializeResponse(codes),
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const adminGetCodesByUserId = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const codes = await AccessCodeService.getAccessCodesByUserId(userId);
    res.json({
      success: true,
      message: "تم جلب أكواد الوصول للمستخدم بنجاح.",
      data: serializeResponse(codes),
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const adminGetCourseCodes = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const codes = await AccessCodeService.getAccessCodesByCourse(courseId);
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم جلب أكواد الدورة بنجاح.',
      data: serializeResponse(codes),
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateAccessCode = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { courseLevelId, userId, validityInMonths, isActive, couponId, amountPaid, notes } = req.body;

    const adminId = req.user.id;
    const receiptImageUrl = req.file ? `/uploads/images/financial/${req.file.filename}` : undefined;
    const parsedCourseLevelId = courseLevelId ? parseInt(courseLevelId, 10) : null;
    const parsedUserId = userId ? parseInt(userId, 10) : null;

    const updatedCode = await AccessCodeService.updateAccessCodeWithTransaction({
      id,
      courseLevelId: parsedCourseLevelId,
      userId: parsedUserId,
      validityInMonths: validityInMonths ? parseInt(validityInMonths, 10) : null,
      isActive,
      issuedBy: adminId,
      couponId: couponId ? parseInt(couponId, 10) : null,
      amountPaid,
      receiptImageUrl,
      notes
    });

    res.json({
      success: true,
      message: `تم تعديل الكود ${updatedCode.code} بنجاح.`,
      data: serializeResponse(updatedCode),
    });

  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};


export const adminToggleAccessCode = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const isActive = !!req.body.isActive;
    const updatedCode = await AccessCodeService.toggleAccessCode(id, isActive);
    res.json({
      success: true,
      message: `تم ${isActive ? "تفعيل" : "تعطيل"} الكود بنجاح.`,
      data: serializeResponse(updatedCode),
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const adminDeleteAccessCode = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await AccessCodeService.deleteAccessCode(id);
    res.json({
      success: true,
      message: "تم حذف الكود بنجاح.",
      data: {},
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

// --- Student Controllers ---

export const studentGetMyCodes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const codes = await AccessCodeService.getAccessCodesByUserId(userId);
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم جلب أكواد الوصول الخاصة بك بنجاح.',
      data: serializeResponse(codes),
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const studentGetMyCourses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const courseLevels = await AccessCodeService.getCourseLevelsByUserId(userId);
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم جلب دوراتك بنجاح.',
      data: serializeResponse(courseLevels),
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const studentActivateCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    const courseLevelId = parseInt(req.params.courseLevelId, 10); // Get courseLevelId from route

    const activatedCode = await AccessCodeService.activateCode(code, userId, courseLevelId);

    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: `تم تفعيل الكود بنجاح! يمكنك الآن الوصول إلى دورة "${activatedCode.courseLevel?.course?.title || ''}"${activatedCode.courseLevel ? ` (المستوى: ${activatedCode.courseLevel.name})` : ''}.`,
      data: serializeResponse({
        courseId: activatedCode.courseLevel?.course?.id,
        ...(activatedCode.courseLevelId ? { courseLevelId: activatedCode.courseLevelId } : {}),
        expiresAt: activatedCode.expiresAt,
      }),
    });
  } catch (error) {
    if (
      error.message.includes('غير صحيح') ||
      error.message.includes('غير موجود') ||
      error.message.includes('تم استخدامه')
    ) {
      error.statusCode = NOT_FOUND_STATUS_CODE;
    } else {
      error.statusCode = BAD_REQUEST_STATUS_CODE;
    }
    next(error);
  }
};

export const studentGetExpiredCourses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const expiredCourses = await AccessCodeService.getExpiredCoursesByUserId(userId);
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم جلب دوراتك المنتهية الصلاحية بنجاح.',
      data: serializeResponse(expiredCourses),
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

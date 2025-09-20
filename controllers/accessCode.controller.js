import * as AccessCodeService from '../services/accessCode.service.js';
import { serializeResponse } from '../utils/serialize.js';
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
    const { courseId, courseLevelId, count, validityInMonths } = req.body;
    const adminId = req.user.id;

    const codes = await AccessCodeService.generateAccessCodes({
      courseId,
      courseLevelId,
      count,
      validityInMonths,
      issuedBy: adminId,
    });
    res.status(SUCCESS_CREATE_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: `تم توليد ${count} أكواد بنجاح.`,
      data: serializeResponse({ codes }),
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

// --- Student Controllers ---

export const studentActivateCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    const activatedCode = await AccessCodeService.activateCode(code, userId);

    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: `تم تفعيل الكود بنجاح! يمكنك الآن الوصول إلى دورة "${activatedCode.course.title}"${activatedCode.courseLevel ? ` (المستوى: ${activatedCode.courseLevel.name})` : ''}.`,
      data: serializeResponse({
        courseId: activatedCode.courseId,
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
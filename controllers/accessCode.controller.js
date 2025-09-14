import * as AccessCodeService from '../services/accessCode.service.js';
import { serializeResponse } from '../utils/serialize.js';
import { FAILURE_REQUEST, SUCCESS_REQUEST } from '../validators/messagesResponse.js';
import { BAD_REQUEST_STATUS_CODE, NOT_FOUND_STATUS_CODE, SUCCESS_CREATE_STATUS_CODE, SUCCESS_STATUS_CODE } from '../validators/statusCode.js';

// --- Admin Controllers ---

export const adminGenerateCodes = async (req, res, next) => {
  try {
    const { courseId, count, validityInMonths } = req.body;
    const adminId = req.user.id;

    const codes = await AccessCodeService.generateAccessCodes(courseId, count, validityInMonths, adminId);
    res.status(SUCCESS_CREATE_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: `تم توليد ${count} أكواد بنجاح.`,
      data: serializeResponse({ codes }),
    });
  } catch (error) {
    error.statusCode = BAD_REQUEST_STATUS_CODE;
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
      message: `تم تفعيل الكود بنجاح! يمكنك الآن الوصول إلى دورة "${activatedCode.course.title}".`,
      data: serializeResponse({
        courseId: activatedCode.courseId,
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
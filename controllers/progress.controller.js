import * as ProgressService from '../services/progress.service.js';
import { serializeResponse } from '../utils/serialize.js';
import { FAILURE_REQUEST, SUCCESS_REQUEST } from '../validators/messagesResponse.js';
import { BAD_REQUEST_STATUS_CODE, FORBIDDEN_STATUS_CODE, NOT_FOUND_STATUS_CODE, SUCCESS_STATUS_CODE } from '../validators/statusCode.js';

const handleServiceError = (error, next) => {
  if (error.message.includes('غير موجود')) {
    error.statusCode = NOT_FOUND_STATUS_CODE;
  } else if (error.message.includes('صلاحية الوصول')) {
    error.statusCode = FORBIDDEN_STATUS_CODE;
  } else {
    error.statusCode = BAD_REQUEST_STATUS_CODE;
  }
  next(error);
};

export const studentMarkLessonComplete = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const lessonId = parseInt(req.params.lessonId, 10);

    const result = await ProgressService.markLessonAsComplete(userId, lessonId);

    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم تحديث تقدمك بنجاح.',
      data: serializeResponse(result),
    });
  } catch (error) {
    handleServiceError(error, next);
  }
};

export const studentGetCourseProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const courseId = parseInt(req.params.courseId, 10);

    const progress = await ProgressService.getCourseProgressForUser(userId, courseId);

    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      data: serializeResponse(progress),
    });
  } catch (error) {
    handleServiceError(error, next);
  }
};

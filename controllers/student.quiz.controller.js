import * as QuizService from '../services/quiz.service.js';
import { serializeResponse } from '../utils/serialize.js';
import { FAILURE_REQUEST, SUCCESS_REQUEST } from '../validators/messagesResponse.js';
import { BAD_REQUEST_STATUS_CODE, FORBIDDEN_STATUS_CODE, NOT_FOUND_STATUS_CODE, SUCCESS_CREATE_STATUS_CODE, SUCCESS_STATUS_CODE } from '../validators/statusCode.js';

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

/**
 * Get a quiz by level id
 */
export const studentGetQuizByLevel = async (req, res, next) => {
  try {
    const levelId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const questions = await QuizService.getQuizByCourseLevelId(levelId, userId);
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم جلب الأسئلة بنجاح.',
      data: serializeResponse(questions),
    });
  } catch (error) {
    handleServiceError(error, next);
  }
};

/**
 * Get a quiz for a student to take.
 * Strips out correct answer information.
 */
export const studentGetQuiz = async (req, res, next) => {
  try {
    const courseLevelId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const questions = await QuizService.getQuizForStudent(courseLevelId, userId);
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم جلب الأسئلة بنجاح.',
      data: serializeResponse(questions),
    });
  } catch (error) {
    handleServiceError(error, next);
  }
};

/**
 * Submit answers for a quiz and get the score.
 */
export const studentSubmitQuiz = async (req, res, next) => {
  try {
    const courseLevelId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { answers } = req.body;

    const result = await QuizService.submitQuiz(courseLevelId, userId, answers);

    res.status(SUCCESS_CREATE_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم تقديم الاختبار بنجاح.',
      data: serializeResponse(result),
    });
  } catch (error) {
    handleServiceError(error, next);
  }
};

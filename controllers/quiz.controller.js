import * as QuizService from '../services/quiz.service.js';
import { serializeResponse } from '../utils/serialize.js';
import { FAILURE_REQUEST, SUCCESS_REQUEST } from '../validators/messagesResponse.js';
import { BAD_REQUEST_STATUS_CODE, NOT_FOUND_STATUS_CODE, SUCCESS_CREATE_STATUS_CODE, SUCCESS_STATUS_CODE } from '../validators/statusCode.js';

const handleServiceError = (error, next) => {
  if (error.message.includes('غير موجود') || error.code === 'P2025') {
    error.statusCode = NOT_FOUND_STATUS_CODE;
  } else {
    error.statusCode = BAD_REQUEST_STATUS_CODE;
  }
  next(error);
};

// --- Quiz Management ---
export const adminCreateQuiz = async (req, res, next) => {
  try {
    const courseLevelId = parseInt(req.params.courseLevelId, 10);
    const quiz = await QuizService.createQuiz(courseLevelId, req.body);
    res.status(SUCCESS_CREATE_STATUS_CODE).json({ success: SUCCESS_REQUEST, message: 'تم إنشاء الاختبار بنجاح.', data: serializeResponse(quiz) });
  } catch (error) {
    handleServiceError(error, next);
  }
};


export const adminGetQuizByCourse = async (req, res, next) => {
  try {
    const courseLevelId = parseInt(req.params.courseLevelId, 10);
    const questions = await QuizService.getQuestionsByCourseLevel(courseLevelId);
    if (!questions || questions.length === 0) return res.status(NOT_FOUND_STATUS_CODE).json({ success: FAILURE_REQUEST, message: 'لا يوجد أسئلة لهذا المستوى' });
    res.status(SUCCESS_STATUS_CODE).json({ success: SUCCESS_REQUEST, data: serializeResponse(questions) });
  } catch (error) {
    handleServiceError(error, next);
  }
};


export const adminDeleteQuiz = async (req, res, next) => {
  try {
    const courseLevelId = parseInt(req.params.courseLevelId, 10);
    await QuizService.deleteQuiz(courseLevelId);
    res.status(SUCCESS_STATUS_CODE).json({ success: SUCCESS_REQUEST, message: 'تم حذف الاختبار بنجاح.' });
  } catch (error) {
    handleServiceError(error, next);
  }
};

// --- Question Management ---
export const adminAddQuestion = async (req, res, next) => {
  try {
    const courseLevelId = parseInt(req.params.courseLevelId, 10);
    const question = await QuizService.addQuestionToCourseLevel(courseLevelId, req.body);
    res.status(SUCCESS_CREATE_STATUS_CODE).json({ success: SUCCESS_REQUEST, message: 'تمت إضافة السؤال بنجاح.', data: serializeResponse(question) });
  } catch (error) {
    handleServiceError(error, next);
  }
};

export const adminUpdateQuestion = async (req, res, next) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    const question = await QuizService.updateQuestion(questionId, req.body);
    res.status(SUCCESS_STATUS_CODE).json({ success: SUCCESS_REQUEST, message: 'تم تحديث السؤال بنجاح.', data: serializeResponse(question) });
  } catch (error) {
    handleServiceError(error, next);
  }
};

export const adminDeleteQuestion = async (req, res, next) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    await QuizService.deleteQuestion(questionId);
    res.status(SUCCESS_STATUS_CODE).json({ success: SUCCESS_REQUEST, message: 'تم حذف السؤال بنجاح.' });
  } catch (error) {
    handleServiceError(error, next);
  }
};

// --- Option Management ---
export const adminUpdateOption = async (req, res, next) => {
  try {
    const optionId = parseInt(req.params.id, 10);
    const option = await QuizService.updateOption(optionId, req.body);
    res.status(SUCCESS_STATUS_CODE).json({ success: SUCCESS_REQUEST, message: 'تم تحديث الخيار بنجاح.', data: serializeResponse(option) });
  } catch (error) {
    handleServiceError(error, next);
  }
};

export const adminDeleteOption = async (req, res, next) => {
  try {
    const optionId = parseInt(req.params.id, 10);
    await QuizService.deleteOption(optionId);
    res.status(SUCCESS_STATUS_CODE).json({ success: SUCCESS_REQUEST, message: 'تم حذف الخيار بنجاح.' });
  } catch (error) {
    handleServiceError(error, next);
  }
};
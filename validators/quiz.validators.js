import { body, param } from 'express-validator';

export const quizIdParam = param('quizId').isInt({ gt: 0 }).withMessage('معرف الاختبار غير صالح');
export const questionIdParam = param('questionId').isInt({ gt: 0 }).withMessage('معرف السؤال غير صالح');

export const createQuizRules = [
  body('title').optional().isString().withMessage('عنوان الاختبار يجب أن يكون نصاً'),
];

export const createQuestionRules = [
  body('text').exists({ checkFalsy: true }).withMessage('نص السؤال مطلوب'),
  body('options')
    .isArray({ min: 2 })
    .withMessage('يجب توفير خيارين على الأقل'),
  body('options.*.text').exists({ checkFalsy: true }).withMessage('نص الخيار مطلوب'),
  body('options.*.isCorrect').isBoolean().withMessage('isCorrect يجب أن تكون قيمة منطقية'),
  body('order').optional().isInt(),
];

export const createOptionRules = [
  body('text').exists({ checkFalsy: true }).withMessage('نص الخيار مطلوب'),
  body('isCorrect').optional().isBoolean(),
];

export const submitQuizRules = [
  body('answers').isArray({ min: 1 }).withMessage('يجب تقديم إجابات'),
  body('answers.*.questionId').isInt({ gt: 0 }).withMessage('معرف السؤال غير صالح'),
  body('answers.*.optionId').isInt({ gt: 0 }).withMessage('معرف الخيار غير صالح'),
];

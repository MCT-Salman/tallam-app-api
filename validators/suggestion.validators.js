import { body, query, param } from 'express-validator';

export const studentCreateSuggestionRules = [
  body('message').exists({ checkFalsy: true }).withMessage('نص الاقتراح مطلوب').isString().isLength({ min: 3, max: 1000 }).withMessage('طول نص الاقتراح غير صالح'),
  body('courseLevelId').optional().isInt({ gt: 0 }).withMessage('courseLevelId غير صالح')
];

export const suggestionIdParam = param('id').isInt({ gt: 0 }).withMessage('id غير صالح');

export const adminListSuggestionQuery = [
  query('userId').optional().isInt({ gt: 0 }),
  query('courseLevelId').optional().isInt({ gt: 0 }),
  query('skip').optional().isInt({ min: 0 }),
  query('take').optional().isInt({ min: 1, max: 100 })
];

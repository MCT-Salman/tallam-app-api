import { body } from 'express-validator';

export const createCodeRequestRules = [
  body('courseId').isInt({ gt: 0 }).withMessage('معرف الدورة مطلوب وغير صالح'),
  body('contact').optional().isString().withMessage('معلومات التواصل يجب أن تكون نصاً'),
];

export const updateCodeRequestStatusRules = [
  body('status').isIn(['APPROVED', 'REJECTED']).withMessage('الحالة غير صالحة. يجب أن تكون APPROVED أو REJECTED'),
];
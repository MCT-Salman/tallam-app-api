import { body, param, query } from 'express-validator';

// Notification types enum
const NOTIFICATION_TYPES = ['GENERAL', 'COURSE_NEW', 'COURSE_UPDATE', 'LESSON_NEW', 'SYSTEM'];

/**
 * Validation rules for creating a notification
 */
export const createNotificationRules = [
  body('title')
    .notEmpty()
    .withMessage('عنوان الإشعار مطلوب')
    .isLength({ min: 1, max: 255 })
    .withMessage('عنوان الإشعار يجب أن يكون بين 1 و 255 حرف'),
  
  body('body')
    .notEmpty()
    .withMessage('محتوى الإشعار مطلوب')
    .isLength({ min: 1, max: 1000 })
    .withMessage('محتوى الإشعار يجب أن يكون بين 1 و 1000 حرف'),
  
  body('type')
    .optional()
    .isIn(NOTIFICATION_TYPES)
    .withMessage(`نوع الإشعار يجب أن يكون أحد القيم التالية: ${NOTIFICATION_TYPES.join(', ')}`),
  
  body('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('معرف المستخدم يجب أن يكون رقم صحيح موجب'),
  
  body('data')
    .optional()
    .custom((value) => {
      if (value && typeof value !== 'object') {
        throw new Error('البيانات الإضافية يجب أن تكون كائن JSON صحيح');
      }
      return true;
    }),
  
  body('link')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الرابط يجب أن يكون أقل من 500 حرف'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('رابط الصورة يجب أن يكون رابط صحيح')
    .isLength({ max: 500 })
    .withMessage('رابط الصورة يجب أن يكون أقل من 500 حرف')
];

/**
 * Validation rules for creating broadcast notification
 */
export const createBroadcastNotificationRules = [
  body('title')
    .notEmpty()
    .withMessage('عنوان الإشعار مطلوب')
    .isLength({ min: 1, max: 255 })
    .withMessage('عنوان الإشعار يجب أن يكون بين 1 و 255 حرف'),
  
  body('body')
    .notEmpty()
    .withMessage('محتوى الإشعار مطلوب')
    .isLength({ min: 1, max: 1000 })
    .withMessage('محتوى الإشعار يجب أن يكون بين 1 و 1000 حرف'),
  
  body('type')
    .optional()
    .isIn(NOTIFICATION_TYPES)
    .withMessage(`نوع الإشعار يجب أن يكون أحد القيم التالية: ${NOTIFICATION_TYPES.join(', ')}`),
  
  body('data')
    .optional()
    .custom((value) => {
      if (value && typeof value !== 'object') {
        throw new Error('البيانات الإضافية يجب أن تكون كائن JSON صحيح');
      }
      return true;
    }),
  
  body('link')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الرابط يجب أن يكون أقل من 500 حرف'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('رابط الصورة يجب أن يكون رابط صحيح')
    .isLength({ max: 500 })
    .withMessage('رابط الصورة يجب أن يكون أقل من 500 حرف')
];

/**
 * Validation rules for creating notification for multiple users
 */
export const createNotificationForUsersRules = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('يجب تحديد معرفات المستخدمين كمصفوفة')
    .custom((userIds) => {
      if (!userIds.every(id => Number.isInteger(Number(id)) && Number(id) > 0)) {
        throw new Error('جميع معرفات المستخدمين يجب أن تكون أرقام صحيحة موجبة');
      }
      return true;
    }),
  
  body('title')
    .notEmpty()
    .withMessage('عنوان الإشعار مطلوب')
    .isLength({ min: 1, max: 255 })
    .withMessage('عنوان الإشعار يجب أن يكون بين 1 و 255 حرف'),
  
  body('body')
    .notEmpty()
    .withMessage('محتوى الإشعار مطلوب')
    .isLength({ min: 1, max: 1000 })
    .withMessage('محتوى الإشعار يجب أن يكون بين 1 و 1000 حرف'),
  
  body('type')
    .optional()
    .isIn(NOTIFICATION_TYPES)
    .withMessage(`نوع الإشعار يجب أن يكون أحد القيم التالية: ${NOTIFICATION_TYPES.join(', ')}`),
  
  body('data')
    .optional()
    .custom((value) => {
      if (value && typeof value !== 'object') {
        throw new Error('البيانات الإضافية يجب أن تكون كائن JSON صحيح');
      }
      return true;
    }),
  
  body('link')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الرابط يجب أن يكون أقل من 500 حرف'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('رابط الصورة يجب أن يكون رابط صحيح')
    .isLength({ max: 500 })
    .withMessage('رابط الصورة يجب أن يكون أقل من 500 حرف')
];

/**
 * Validation rules for updating FCM token
 */
export const updateFCMTokenRules = [
  body('fcmToken')
    .notEmpty()
    .withMessage('رمز FCM مطلوب')
    .isLength({ min: 10, max: 500 })
    .withMessage('رمز FCM غير صحيح')
];

/**
 * Validation rules for notification ID parameter
 */
export const notificationIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف الإشعار يجب أن يكون رقم صحيح موجب')
];

/**
 * Validation rules for getting notifications query parameters
 */
export const getNotificationsQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('رقم الصفحة يجب أن يكون رقم صحيح موجب'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('حد النتائج يجب أن يكون بين 1 و 100'),
  
  query('type')
    .optional()
    .isIn(NOTIFICATION_TYPES)
    .withMessage(`نوع الإشعار يجب أن يكون أحد القيم التالية: ${NOTIFICATION_TYPES.join(', ')}`),
  
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('معرف المستخدم يجب أن يكون رقم صحيح موجب')
];

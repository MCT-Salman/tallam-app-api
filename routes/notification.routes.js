import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  studentGetNotifications,
  studentGetUnreadCount,
  studentMarkAsRead,
  studentMarkAllAsRead,
  studentUpdateFCMToken,
  adminGetAllNotifications,
  adminCreateNotification,
  adminCreateBroadcastNotification,
  adminCreateNotificationForUsers,
  adminDeleteNotification
} from '../controllers/notification.controller.js';
import {
  createNotificationRules,
  createBroadcastNotificationRules,
  createNotificationForUsersRules,
  updateFCMTokenRules,
  notificationIdParam,
  getNotificationsQuery
} from '../validators/notification.validators.js';

const router = Router();

// ==================== Student Routes ====================
router.get('/', requireAuth, requireRole(['STUDENT']), validate(getNotificationsQuery), studentGetNotifications);

router.get('/unread-count', requireAuth, requireRole(['STUDENT']), studentGetUnreadCount);

router.put('/:id/read', requireAuth, requireRole(['STUDENT']), validate(notificationIdParam), studentMarkAsRead);

router.put('/read-all', requireAuth, requireRole(['STUDENT']), studentMarkAllAsRead);

router.put('/fcm-token', requireAuth, requireRole(['STUDENT']), validate(updateFCMTokenRules), studentUpdateFCMToken);

// ==================== Admin Routes ====================

router.get('/admin', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(getNotificationsQuery), adminGetAllNotifications);

router.post('/admin', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(createNotificationRules), adminCreateNotification);

router.post('/admin/broadcast', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(createBroadcastNotificationRules), adminCreateBroadcastNotification);

router.post('/admin/users',requireAuth,requireRole(['ADMIN', 'SUBADMIN']),validate(createNotificationForUsersRules),adminCreateNotificationForUsers);

router.delete('/admin/:id',requireAuth,requireRole(['ADMIN', 'SUBADMIN']),validate(notificationIdParam),adminDeleteNotification);

export default router;

import { serializeResponse } from "../utils/serialize.js";
import * as NotificationService from "../services/notification.service.js";
import { SUCCESS_REQUEST, FAILURE_REQUEST } from "../validators/messagesResponse.js";
import { SUCCESS_STATUS_CODE, BAD_REQUEST_STATUS_CODE, SUCCESS_CREATE_STATUS_CODE } from "../validators/statusCode.js";

/**
 * Student: Get user notifications
 */
export const studentGetNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type } = req.query;

    const result = await NotificationService.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      type
    });

    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: "تم جلب الإشعارات بنجاح",
      data: result
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

/**
 * Student: Get unread notifications count
 */
export const studentGetUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const count = await NotificationService.getUnreadCount(userId);

    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: "تم جلب عدد الإشعارات غير المقروءة بنجاح",
      data: { unreadCount: count }
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

/**
 * Student: Mark notification as read
 */
export const studentMarkAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.id);

    const notification = await NotificationService.markNotificationAsRead(notificationId, userId);

    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: "تم تحديد الإشعار كمقروء بنجاح",
      data: serializeResponse(notification)
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

/**
 * Student: Mark all notifications as read
 */
export const studentMarkAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await NotificationService.markAllUserNotificationsAsRead(userId);

    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: "تم تحديد جميع الإشعارات كمقروءة بنجاح",
      data: { updatedCount: result.count }
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

/**
 * Student: Update FCM token
 */
export const studentUpdateFCMToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fcmToken } = req.body;

    await NotificationService.updateUserFCMToken(userId, fcmToken);

    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: "تم تحديث رمز الإشعارات بنجاح",
      data: {}
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

/**
 * Admin: Get all notifications
 */
export const adminGetAllNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, userId } = req.query;

    const result = await NotificationService.getAllNotifications({
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      userId: userId ? parseInt(userId) : undefined
    });

    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: "تم جلب جميع الإشعارات بنجاح",
      data: serializeResponse(result)
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

/**
 * Admin: Create notification for specific user
 */
export const adminCreateNotification = async (req, res, next) => {
  try {
    const { userId, title, body, type = 'GENERAL', data, link, imageUrl } = req.body;

    const notification = await NotificationService.createNotification({
      userId: userId ? parseInt(userId) : null,
      title,
      body,
      type,
      data,
      link,
      imageUrl
    });

    res.status(SUCCESS_CREATE_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: "تم إنشاء الإشعار بنجاح",
      data: serializeResponse(notification)
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

/**
 * Admin: Create broadcast notification
 */
export const adminCreateBroadcastNotification = async (req, res, next) => {
  try {
    const { title, body, type = 'GENERAL', data, link, imageUrl } = req.body;

    const result = await NotificationService.createBroadcastNotification({
      title,
      body,
      type,
      data,
      link,
      imageUrl
    });

    res.status(SUCCESS_CREATE_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: `تم إرسال الإشعار لجميع المستخدمين بنجاح (${result.count} مستخدم)`,
      data: serializeResponse(result)
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

/**
 * Admin: Create notification for multiple users
 */
export const adminCreateNotificationForUsers = async (req, res, next) => {
  try {
    const { userIds, title, body, type = 'GENERAL', data, link, imageUrl } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(BAD_REQUEST_STATUS_CODE).json({
        success: FAILURE_REQUEST,
        message: "يجب تحديد معرفات المستخدمين",
        data: {}
      });
    }

    const result = await NotificationService.createNotificationsForUsers(
      userIds.map(id => parseInt(id)),
      {
        title,
        body,
        type,
        data,
        link,
        imageUrl
      }
    );

    res.status(SUCCESS_CREATE_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: `تم إرسال الإشعار للمستخدمين المحددين بنجاح (${result.count} مستخدم)`,
      data: serializeResponse(result)
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

/**
 * Admin: Delete notification
 */
export const adminDeleteNotification = async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);

    await NotificationService.deleteNotification(notificationId);

    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: "تم حذف الإشعار بنجاح",
      data: {}
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

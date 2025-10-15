import * as NotificationModel from '../models/notification.model.js';
import * as UserModel from '../models/user.model.js';
import { sendPushNotification, sendPushNotificationToMultiple, validateFCMToken } from '../utils/firebase.js';
import prisma from '../prisma/client.js';

/**
 * Create a notification and optionally send push notification
 * @param {object} notificationData - Notification data
 * @param {boolean} sendPush - Whether to send push notification
 * @returns {Promise<object>} - Created notification
 */
export const createNotification = async (notificationData, sendPush = true) => {
  try {
    // Create notification in database
    const notification = await NotificationModel.create(notificationData);

    // Always attempt to send push notification for better user experience
    if (sendPush && notification.user?.fcmToken) {
      // Validate FCM token before sending
      if (validateFCMToken(notification.user.fcmToken)) {
        try {
          console.log(`إرسال إشعار فوري للمستخدم: ${notification.user.name || notification.userId}`);

          const pushResult = await sendPushNotification(
            notification.user.fcmToken,
            {
              title: notification.title,
              body: notification.body,
              imageUrl: notification.imageUrl
            },
            {
              notificationId: notification.id.toString(),
              type: notification.type,
              link: notification.link || '',
              userId: notification.userId?.toString() || '',
              timestamp: new Date().toISOString(),
              ...(notification.data && { customData: JSON.stringify(notification.data) })
            }
          );

          // Update notification to mark as sent to FCM
          if (pushResult) {
            await NotificationModel.updateById(notification.id, { sentToFCM: true });
            console.log(`✅ تم إرسال الإشعار الفوري بنجاح - ID: ${notification.id}`);
          }
        } catch (pushError) {
          console.error(`❌ فشل إرسال الإشعار الفوري للمستخدم ${notification.userId}:`, pushError.message);
          // Don't fail the whole operation if push notification fails
        }
      } else {
        console.log(`⚠️ FCM Token غير صحيح للمستخدم ${notification.userId}`);
      }
    } else if (notification.userId && sendPush) {
      console.log(`⚠️ لا يوجد FCM Token للمستخدم ${notification.userId} - سيتم عرض الإشعار داخل التطبيق فقط`);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create notifications for multiple users
 * @param {array} userIds - Array of user IDs
 * @param {object} notificationData - Notification data (without userId)
 * @param {boolean} sendPush - Whether to send push notifications
 * @returns {Promise<object>} - Creation result
 */
export const createNotificationsForUsers = async (userIds, notificationData, sendPush = true) => {
  try {
    // Create notifications for all users
    const notifications = userIds.map(userId => ({
      ...notificationData,
      userId
    }));

    await NotificationModel.createMany(notifications);

    // Always attempt to send push notifications for better user experience
    if (sendPush) {
      // Get FCM tokens for users
      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds },
          fcmToken: { not: null }
        },
        select: { id: true, name: true, fcmToken: true }
      });

      if (users.length > 0) {
        // Validate FCM tokens before sending
        const validUsers = users.filter(user => validateFCMToken(user.fcmToken));
        const fcmTokens = validUsers.map(user => user.fcmToken);

        if (fcmTokens.length > 0) {
          try {
            console.log(` إرسال إشعارات فورية لـ ${fcmTokens.length} مستخدم`);

            await sendPushNotificationToMultiple(
              fcmTokens,
              {
                title: notificationData.title,
                body: notificationData.body,
                imageUrl: notificationData.imageUrl
              },
              {
                type: notificationData.type,
                link: notificationData.link || '',
                timestamp: new Date().toISOString(),
                bulkNotification: true,
                ...(notificationData.data && { customData: JSON.stringify(notificationData.data) })
              }
            );

            // Mark notifications as sent to FCM for valid users only
            await NotificationModel.updateMany(
              {
                userId: { in: validUsers.map(u => u.id) },
                title: notificationData.title,
                body: notificationData.body
              },
              { sentToFCM: true }
            );

            console.log(`✅ تم إرسال الإشعارات الفورية بنجاح لـ ${fcmTokens.length} مستخدم`);
          } catch (pushError) {
            console.error(`❌ فشل إرسال الإشعارات الفورية:`, pushError.message);
          }
        } else {
          console.log(`⚠️ لا توجد FCM Tokens صحيحة من أصل ${users.length} مستخدم`);
        }
      } else {
        console.log(`⚠️ لا يوجد مستخدمين لديهم FCM Tokens من أصل ${userIds.length} مستخدم`);
      }
    }

    return { success: true, count: userIds.length };
  } catch (error) {
    console.error('Error creating notifications for users:', error);
    throw error;
  }
};

/**
 * Create broadcast notification for all active users
 * @param {object} notificationData - Notification data
 * @param {boolean} sendPush - Whether to send push notifications
 * @returns {Promise<object>} - Creation result
 */
export const createBroadcastNotification = async (notificationData, sendPush = true) => {
  try {
    console.log(` إنشاء إشعار عام لجميع المستخدمين النشطين...`);

    // Get all active users
    const activeUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, fcmToken: true }
    });

    console.log(` تم العثور على ${activeUsers.length} مستخدم نشط`);

    const userIds = activeUsers.map(user => user.id);
    const usersWithFCM = activeUsers.filter(user => user.fcmToken && validateFCMToken(user.fcmToken));

    console.log(`📱 ${usersWithFCM.length} مستخدم لديهم FCM Tokens صحيحة`);

    const result = await createNotificationsForUsers(userIds, notificationData, sendPush);

    console.log(`✅ تم إنشاء الإشعار العام بنجاح`);
    return result;
  } catch (error) {
    console.error('Error creating broadcast notification:', error);
    throw error;
  }
};

/**
 * Get notifications for a user with pagination
 * @param {number} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise<object>} - Notifications with pagination info
 */
export const getUserNotifications = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 20, type } = options;
    const skip = (page - 1) * limit;

    const where = { userId };
    if (type) {
      where.type = type;
    }

    const [notifications, total] = await Promise.all([
      NotificationModel.findAll(where, { skip, take: limit }),
      NotificationModel.count(where)
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Get all notifications with pagination (admin)
 * @param {object} options - Query options
 * @returns {Promise<object>} - Notifications with pagination info
 */
export const getAllNotifications = async (options = {}) => {
  try {
    const { page = 1, limit = 20, type, userId } = options;
    const skip = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;
    if (userId) where.userId = userId;

    const [notifications, total] = await Promise.all([
      NotificationModel.findAll(where, { skip, take: limit }),
      NotificationModel.count(where)
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting all notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<object>} - Updated notification
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    // Verify notification belongs to user
    const notification = await NotificationModel.findById(notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error('الإشعار غير موجود أو غير مصرح لك بالوصول إليه');
    }

    return await NotificationModel.markAsRead(notificationId);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all user notifications as read
 * @param {number} userId - User ID
 * @returns {Promise<object>} - Update result
 */
export const markAllUserNotificationsAsRead = async (userId) => {
  try {
    return await NotificationModel.markAllUserNotificationsAsRead(userId);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Get unread notifications count for user
 * @param {number} userId - User ID
 * @returns {Promise<number>} - Count of unread notifications
 */
export const getUnreadCount = async (userId) => {
  try {
    return await NotificationModel.getUnreadCount(userId);
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

/**
 * Delete notification (admin only)
 * @param {number} notificationId - Notification ID
 * @returns {Promise<object>} - Deleted notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    return await NotificationModel.deleteById(notificationId);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Update user FCM token
 * @param {number} userId - User ID
 * @param {string} fcmToken - FCM token
 * @returns {Promise<object>} - Updated user
 */
export const updateUserFCMToken = async (userId, fcmToken) => {
  try {
    return await UserModel.updateById(userId, { fcmToken });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    throw error;
  }
};

/**
 * Send notification for new course creation
 * @param {object} course - Course data
 * @returns {Promise<object>} - Creation result
 */
export const sendNewCourseNotification = async (course) => {
  try {
    console.log(`إرسال إشعار دورة جديدة: ${course.title}`);

    const notificationData = {
      title: 'دورة جديدة متاحة',
      body: `تم إضافة دورة جديدة: ${course.title}`,
      type: 'COURSE_NEW',
      data: {
        courseId: course.id,
        courseTitle: course.title,
        action: 'view_course'
      },
      link: `/api/catalog/courses/${course.id}/instructors`,
      imageUrl: '/uploads/iconsnotication/Addnew-8.png'
    };

    const result = await createBroadcastNotification(notificationData, true);
    console.log(`✅ تم إرسال إشعار الدورة الجديدة بنجاح`);
    return result;
  } catch (error) {
    console.error('Error sending new course notification:', error);
    throw error;
  }
};

/**
 * Send notification for course subscription
 * @param {object} user - User data
 * @param {object} courseLevel - Course level data
 * @returns {Promise<object>} - Creation result
 */
export const sendCourseSubscriptionNotification = async (user, courseLevel) => {
  try {
    console.log(` إرسال إشعار اشتراك للمستخدم: ${user.name} في ${courseLevel.name}`);

    const notificationData = {
      title: 'تم الاشتراك بنجاح',
      body: `مرحباً ${user.name}، تم تفعيل اشتراكك في: ${courseLevel.name} من المادة ${courseLevel.course?.title} للمدرس ${courseLevel.instructor?.name}`,
      type: 'COURSE_UPDATE',
      data: {
        courseLevelId: courseLevel.id,
        courseLevelName: courseLevel.name,
        action: 'view_course_level'
      },
      link: `/api/lessons/levels/${courseLevel.id}`,
      imageUrl: '/uploads/iconsnotication/Subscripe-8.png'
    };

    const result = await createNotification({
      userId: user.id,
      ...notificationData
    }, true);

    console.log(`✅ تم إرسال إشعار الاشتراك بنجاح للمستخدم: ${user.name}`);
    return result;
  } catch (error) {
    console.error('Error sending course subscription notification:', error);
    throw error;
  }
};

/**
 * Send notification for new course level
 * @param {object} courseLevel - Course level data
 * @returns {Promise<object>} - Creation result
 */
export const sendNewCourseLevelNotification = async (courseLevel) => {
  try {
    console.log(`إرسال إشعار مستوى جديد: ${courseLevel.name}`);

    const userIds = await prisma.user.findMany({
      select: { id: true },
      where: { role: 'STUDENT' }
    }).then(users => users.map(user => user.id));

    const instructor = await prisma.instructor.findUnique({
      where: { id: courseLevel.instructorId },
      select: { id: true, name: true }
    });

    const notificationData = {
      title: 'مستوى جديد متاح',
      body: `تم إضافة مستوى جديد: ${courseLevel.name} في دورة ${courseLevel.course?.title || 'الدورة'}`,
      type: 'LESSON_NEW',
      data: {
        courseLevelId: courseLevel.id,
        courseLevelName: courseLevel.name,
        courseId: courseLevel.courseId,
        instructorId: instructor.id,
        instructorName: instructor.name,
        courseTitle: courseLevel.course?.title,
        action: 'view_new_level'
      },
      link: `/api/lessons/levels/${courseLevel.id}`,
      imageUrl: '/uploads/iconsnotication/level-8.png'
    };

    const result = await createNotificationsForUsers(userIds, notificationData, true);
    console.log(`✅ تم إرسال إشعارات المستوى الجديد لـ ${userIds.length} مستخدم`);
    return result;
  } catch (error) {
    console.error('Error sending new course level notification:', error);
    throw error;
  }
};


export const sendNewLessonNotification = async (lesson) => {
  try {
    console.log(`إرسال إشعار درس جديد: ${lesson.name}`);

    const userIds = (await prisma.user.findMany({
      select: { id: true },
      where: { role: 'STUDENT' }
    })).map(u => u.id);

    const courseLevel = await prisma.courseLevel.findUnique({
      where: { id: lesson.courseLevelId },
      select: { 
        id: true, 
        name: true, 
        instructorId: true, 
        courseId: true,
        course: { select: { id: true, title: true } }
      }
    });
    if (!courseLevel) throw new Error('المستوى غير موجود');

    const instructor = await prisma.instructor.findUnique({
      where: { id: courseLevel.instructorId },
      select: { id: true, name: true }
    });

    const notificationData = {
      title: 'كورس جديد متاح',
      body: `تم إضافة كورس جديد ${courseLevel.course?.title} ${courseLevel.name}`,
      type: 'LESSON_NEW',
      data: {
        courseLevelId: courseLevel.id,
        courseLevelName: courseLevel.name,
        courseId: courseLevel.courseId,
        instructorId: instructor?.id,
        instructorName: instructor?.name,
        courseTitle: courseLevel.course?.title,
        action: 'view_new_level'
      },
      link: `/api/lessons/levels/${courseLevel.id}`,
      imageUrl: '/uploads/iconsnotication/level-8.png'
    };

    // 5️⃣ إرسال الإشعارات
    const result = await createNotificationsForUsers(userIds, notificationData, true);

    console.log(`✅ تم إرسال إشعارات الدرس الجديد لـ ${userIds.length} مستخدم`);
    return result;

  } catch (error) {
    console.error('❌ Error sending new lesson notification:', error);
    throw error;
  }
};

/**
 * Check and send access code expiration notifications
 * @param {number} userId - User ID to check codes for
 * @returns {Promise<object>} - Check result
 */
export const checkAndSendExpirationNotifications = async (userId) => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Find codes expiring in 3 days
    const codesExpiringIn3Days = await prisma.accessCode.findMany({
      where: {
        usedBy: userId,
        used: true,
        expiresAt: {
          gte: threeDaysFromNow,
          lt: new Date(threeDaysFromNow.getTime() + 24 * 60 * 60 * 1000) // Next day after 3 days
        }
      },
      include: {
        courseLevel: {
          include: {
            course: {
              select: { id: true, title: true }
            }
          }
        }
      }
    });

    // Find codes expiring today
    const codesExpiringToday = await prisma.accessCode.findMany({
      where: {
        usedBy: userId,
        used: true,
        expiresAt: {
          gte: now,
          lt: endOfToday
        }
      },
      include: {
        courseLevel: {
          include: {
            course: {
              select: { id: true, title: true }
            }
          }
        }
      }
    });

    let notificationsSent = 0;

    // Send 3-day warning notifications
    for (const code of codesExpiringIn3Days) {
      // Check if we already sent a 3-day warning for this code
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: userId,
          type: 'SYSTEM',
          data: {
            path: ['accessCodeId'],
            equals: code.id
          },
          title: { contains: '3 أيام' }
        }
      });

      if (!existingNotification) {
        console.log(`⚠️ إرسال تحذير 3 أيام للمستخدم ${userId} - الكورس: ${code.courseLevel.name}`);

        await createNotification({
          userId: userId,
          title: 'تنبيه: انتهاء صلاحية الاشتراك قريباً',
          body: `سينتهي اشتراكك في "${code.courseLevel.name}" خلال 3 أيام. يرجى تجديد الاشتراك لمواصلة الوصول للمحتوى.`,
          type: 'SYSTEM',
          data: {
            accessCodeId: code.id,
            courseLevelId: code.courseLevelId,
            expiresAt: code.expiresAt,
            warningType: '3_days',
            action: 'renew_subscription'
          },
          link: `/api/lessons/levels/${code.courseLevelId}`,
          imageUrl: '/uploads/iconsnotication/Alert-8.png'
        }, true);
        notificationsSent++;
      }
    }

    // Send same-day expiration notifications
    for (const code of codesExpiringToday) {
      // Check if we already sent a same-day warning for this code
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: userId,
          type: 'SYSTEM',
          data: {
            path: ['accessCodeId'],
            equals: code.id
          },
          title: { contains: 'اليوم' }
        }
      });

      if (!existingNotification) {
        console.log(`🚨 إرسال تحذير عاجل للمستخدم ${userId} - الكورس: ${code.courseLevel.name}`);

        await createNotification({
          userId: userId,
          title: 'تحذير عاجل: انتهاء صلاحية الاشتراك اليوم',
          body: `سينتهي اشتراكك في "${code.courseLevel.name}" اليوم! يرجى تجديد الاشتراك فوراً لتجنب فقدان الوصول.`,
          type: 'SYSTEM',
          data: {
            accessCodeId: code.id,
            courseLevelId: code.courseLevelId,
            expiresAt: code.expiresAt,
            warningType: 'same_day',
            action: 'urgent_renewal'
          },
          link: `/api/lessons/levels/${code.courseLevelId}`,
          imageUrl: '/uploads/iconsnotication/Alert-8.png'
        }, true);
        notificationsSent++;
      }
    }

    return {
      success: true,
      notificationsSent,
      codesExpiringIn3Days: codesExpiringIn3Days.length,
      codesExpiringToday: codesExpiringToday.length
    };

  } catch (error) {
    console.error('Error checking access code expiration:', error);
    throw error;
  }
};

/**
 * Send instant push notification to all active users with FCM tokens
 * @param {object} notificationData - Notification data
 * @returns {Promise<object>} - Send result
 */
export const sendInstantPushToAllUsers = async (notificationData) => {
  try {
    console.log(`إرسال إشعار فوري لجميع المستخدمين النشطين...`);

    // Get all active users with valid FCM tokens
    const activeUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        fcmToken: { not: null }
      },
      select: { id: true, name: true, fcmToken: true }
    });

    if (activeUsers.length === 0) {
      console.log(`⚠️ لا يوجد مستخدمين نشطين لديهم FCM Tokens`);
      return { success: true, sent: 0, total: 0 };
    }

    // Validate FCM tokens
    const validUsers = activeUsers.filter(user => validateFCMToken(user.fcmToken));
    const fcmTokens = validUsers.map(user => user.fcmToken);

    if (fcmTokens.length === 0) {
      console.log(`⚠️ لا توجد FCM Tokens صحيحة من أصل ${activeUsers.length} مستخدم`);
      return { success: true, sent: 0, total: activeUsers.length };
    }

    console.log(`📱 إرسال إشعار فوري لـ ${fcmTokens.length} مستخدم من أصل ${activeUsers.length}`);

    // Send push notification
    const pushResult = await sendPushNotificationToMultiple(
      fcmTokens,
      {
        title: notificationData.title,
        body: notificationData.body,
        imageUrl: notificationData.imageUrl
      },
      {
        type: notificationData.type || 'GENERAL',
        link: notificationData.link || '',
        timestamp: new Date().toISOString(),
        instantPush: true,
        ...(notificationData.data && { customData: JSON.stringify(notificationData.data) })
      }
    );

    console.log(`✅ تم إرسال الإشعار الفوري بنجاح لـ ${fcmTokens.length} مستخدم`);

    return {
      success: true,
      sent: fcmTokens.length,
      total: activeUsers.length,
      pushResult
    };

  } catch (error) {
    console.error('Error sending instant push notification:', error);
    throw error;
  }
};

/**
 * Send instant push notification to specific user
 * @param {number} userId - User ID
 * @param {object} notificationData - Notification data
 * @returns {Promise<object>} - Send result
 */
export const sendInstantPushToUser = async (userId, notificationData) => {
  try {
    console.log(`إرسال إشعار فوري للمستخدم: ${userId}`);

    // Get user with FCM token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, fcmToken: true, isActive: true }
    });

    if (!user) {
      throw new Error(`المستخدم ${userId} غير موجود`);
    }

    if (!user.isActive) {
      console.log(`⚠️ المستخدم ${userId} غير نشط`);
      return { success: false, reason: 'user_inactive' };
    }

    if (!user.fcmToken) {
      console.log(`⚠️ المستخدم ${userId} لا يملك FCM Token`);
      return { success: false, reason: 'no_fcm_token' };
    }

    if (!validateFCMToken(user.fcmToken)) {
      console.log(`⚠️ FCM Token غير صحيح للمستخدم ${userId}`);
      return { success: false, reason: 'invalid_fcm_token' };
    }

    // Send push notification
    const pushResult = await sendPushNotification(
      user.fcmToken,
      {
        title: notificationData.title,
        body: notificationData.body,
        imageUrl: notificationData.imageUrl
      },
      {
        type: notificationData.type || 'GENERAL',
        link: notificationData.link || '',
        userId: userId.toString(),
        timestamp: new Date().toISOString(),
        instantPush: true,
        ...(notificationData.data && { customData: JSON.stringify(notificationData.data) })
      }
    );

    console.log(`✅ تم إرسال الإشعار الفوري بنجاح للمستخدم: ${user.name || userId}`);

    return {
      success: true,
      user: { id: user.id, name: user.name },
      pushResult
    };

  } catch (error) {
    console.error(`Error sending instant push notification to user ${userId}:`, error);
    throw error;
  }
};

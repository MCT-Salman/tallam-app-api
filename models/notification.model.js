import prisma from "../prisma/client.js";

/**
 * Create a new notification
 * @param {object} data - Notification data
 * @returns {Promise<object>} - Created notification
 */
export const create = (data) => prisma.notification.create({ 
  data,
  include: {
    user: {
      select: {
        id: true,
        name: true,
        phone: true,
        fcmToken: true
      }
    }
  }
});

/**
 * Create multiple notifications
 * @param {array} dataArray - Array of notification data
 * @returns {Promise<object>} - Batch creation result
 */
export const createMany = (dataArray) => prisma.notification.createMany({ 
  data: dataArray,
  skipDuplicates: true
});

/**
 * Find all notifications with optional filtering
 * @param {object} where - Where conditions
 * @param {object} options - Query options (select, orderBy, skip, take)
 * @returns {Promise<array>} - Array of notifications
 */
export const findAll = (where = {}, options = {}) => {
  const { select, orderBy = { createdAt: 'desc' }, skip, take } = options;
  
  return prisma.notification.findMany({ 
    where, 
    orderBy,
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
    ...(select ? { select } : {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    })
  });
};

/**
 * Find notification by ID
 * @param {number} id - Notification ID
 * @param {object} select - Fields to select
 * @returns {Promise<object|null>} - Notification or null
 */
export const findById = (id, select) => prisma.notification.findUnique({ 
  where: { id }, 
  ...(select ? { select } : {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      }
    }
  })
});

/**
 * Find notifications by user ID
 * @param {number} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise<array>} - Array of user notifications
 */
export const findByUserId = (userId, options = {}) => {
  const { skip, take, orderBy = { createdAt: 'desc' } } = options;
  
  return prisma.notification.findMany({
    where: { userId },
    orderBy,
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take })
  });
};

/**
 * Update notification by ID
 * @param {number} id - Notification ID
 * @param {object} data - Update data
 * @param {object} select - Fields to select
 * @returns {Promise<object>} - Updated notification
 */
export const updateById = (id, data, select) => prisma.notification.update({ 
  where: { id }, 
  data, 
  ...(select ? { select } : {})
});

/**
 * Update multiple notifications
 * @param {object} where - Where conditions
 * @param {object} data - Update data
 * @returns {Promise<object>} - Update result
 */
export const updateMany = (where, data) => prisma.notification.updateMany({ 
  where, 
  data 
});

/**
 * Delete notification by ID
 * @param {number} id - Notification ID
 * @returns {Promise<object>} - Deleted notification
 */
export const deleteById = (id) => prisma.notification.delete({ where: { id } });

/**
 * Delete multiple notifications
 * @param {object} where - Where conditions
 * @returns {Promise<object>} - Delete result
 */
export const deleteMany = (where) => prisma.notification.deleteMany({ where });

/**
 * Count notifications
 * @param {object} where - Where conditions
 * @returns {Promise<number>} - Count of notifications
 */
export const count = (where = {}) => prisma.notification.count({ where });

/**
 * Mark notification as read
 * @param {number} id - Notification ID
 * @returns {Promise<object>} - Updated notification
 */
export const markAsRead = (id) => prisma.notification.update({
  where: { id },
  data: { isRead: true }
});

/**
 * Mark multiple notifications as read
 * @param {array} ids - Array of notification IDs
 * @returns {Promise<object>} - Update result
 */
export const markMultipleAsRead = (ids) => prisma.notification.updateMany({
  where: { id: { in: ids } },
  data: { isRead: true }
});

/**
 * Mark all user notifications as read
 * @param {number} userId - User ID
 * @returns {Promise<object>} - Update result
 */
export const markAllUserNotificationsAsRead = (userId) => prisma.notification.updateMany({
  where: { userId, isRead: false },
  data: { isRead: true }
});

/**
 * Get unread notifications count for user
 * @param {number} userId - User ID
 * @returns {Promise<number>} - Count of unread notifications
 */
export const getUnreadCount = (userId) => prisma.notification.count({
  where: { userId, isRead: false }
});

/**
 * Get recent notifications for user
 * @param {number} userId - User ID
 * @param {number} limit - Number of notifications to fetch
 * @returns {Promise<array>} - Array of recent notifications
 */
export const getRecentForUser = (userId, limit = 10) => prisma.notification.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  take: limit
});

/**
 * Delete old notifications (cleanup)
 * @param {number} daysOld - Delete notifications older than this many days
 * @returns {Promise<object>} - Delete result
 */
export const deleteOldNotifications = (daysOld = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return prisma.notification.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate
      }
    }
  });
};

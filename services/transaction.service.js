import prisma from "../prisma/client.js";

/**
 * Get all transactions with filtering, sorting, and pagination
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @param {Object} sorting - Sorting options
 * @returns {Promise<Object>} - Transactions with pagination info
 */
export const getTransactions = async (filters = {}, pagination = {}, sorting = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;
  const take = limit;

  const where = {};
  const { accessCodeId, couponId, minAmount, maxAmount, startDate, endDate } = filters;

  if (accessCodeId) where.accessCodeId = parseInt(accessCodeId);
  if (couponId) where.couponId = parseInt(couponId);
  if (minAmount) where.amountPaid = { ...where.amountPaid, gte: parseFloat(minAmount) };
  if (maxAmount) where.amountPaid = { ...where.amountPaid, lte: parseFloat(maxAmount) };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const orderBy = {};
  if (sorting.sortBy) {
    orderBy[sorting.sortBy] = sorting.sortOrder || 'desc';
  } else {
    orderBy.createdAt = 'desc';
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        accessCode: {
          select: {
            id: true,
            code: true,
            courseLevel: {
              select: {
                id: true,
                name: true,
                course: {
                  select: {
                    id: true,
                    title: true
                  }
                }
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                sex: true,
                birthDate: true,
                avatarUrl: true,
                country: true,
                countryCode: true,
                role: true,
                isActive: true
              }
            }
          }
        },
        coupon: {
          select: {
            id: true,
            code: true,
            discount: true,
            isPercent: true
          }
        }
      }
    }),
    prisma.transaction.count({ where })
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get a specific transaction by ID
 * @param {number} transactionId - ID of the transaction
 * @returns {Promise<Object>} - Transaction object
 */
export const getTransactionById = async (transactionId) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: parseInt(transactionId) },
    include: {
      accessCode: {
        select: {
          id: true,
          code: true,
          courseLevel: {
            select: {
              id: true,
              name: true,
              course: {
                select: {
                  id: true,
                  title: true,
                  specialization: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          },
          user: {
            select: {
               id: true,
                name: true,
                phone: true,
                sex: true,
                birthDate: true,
                avatarUrl: true,
                country: true,
                countryCode: true,
                role: true,
                isActive: true
            }
          }
        }
      },
      coupon: {
        select: {
          id: true,
          code: true,
          discount: true,
          isPercent: true,
          maxUsage: true,
          usedCount: true
        }
      }
    }
  });

  if (!transaction) {
    throw new Error("المعاملة غير موجودة");
  }

  return transaction;
};

/**
 * Get transaction statistics
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Statistics object
 */
export const getTransactionStats = async (filters = {}) => {
  const where = {};
  const { startDate, endDate } = filters;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [totalTransactions, totalAmount, averageAmount, stats] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.aggregate({
      where,
      _sum: { amountPaid: true }
    }),
    prisma.transaction.aggregate({
      where,
      _avg: { amountPaid: true }
    }),
    prisma.transaction.aggregate({
      where,
      _min: { amountPaid: true },
      _max: { amountPaid: true },
      _count: { amountPaid: true }
    })
  ]);

  return {
    totalTransactions,
    totalAmount: Number(totalAmount._sum.amountPaid || 0),
    averageAmount: Number(averageAmount._avg.amountPaid || 0),
    maxAmount: Number(stats._max.amountPaid || 0),
    transactionCount: stats._count.amountPaid
  };
};

/**
 * Get transactions grouped by date for analytics
 * @param {Object} filters - Filter options
 * @param {string} groupBy - 'day', 'week', 'month'
 * @returns {Promise<Array>} - Transactions grouped by date
 */
export const getTransactionsByDate = async (filters = {}, groupBy = 'day') => {
  const where = {};
  const { startDate, endDate } = filters;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  // Group transactions by date using Prisma
  const transactions = await prisma.transaction.groupBy({
    by: ['createdAt'],
    where,
    _count: { id: true },
    _sum: { amountPaid: true },
    _avg: { amountPaid: true },
    orderBy: { createdAt: 'desc' }
  });

  // Format the results based on groupBy parameter
  const formattedTransactions = transactions.map(transaction => {
    const date = new Date(transaction.createdAt);
    let dateKey;

    switch (groupBy) {
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        dateKey = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'day':
      default:
        dateKey = date.toISOString().split('T')[0];
        break;
    }

    return {
      date: dateKey,
      count: transaction._count.id,
      totalAmount: Number(transaction._sum.amountPaid || 0),
      avgAmount: Number(transaction._avg.amountPaid || 0)
    };
  });

  // Group by date key and sum the values
  const groupedResults = {};
  formattedTransactions.forEach(item => {
    if (groupedResults[item.date]) {
      groupedResults[item.date].count += item.count;
      groupedResults[item.date].totalAmount += item.totalAmount;
      groupedResults[item.date].avgAmount = (groupedResults[item.date].avgAmount + item.avgAmount) / 2;
    } else {
      groupedResults[item.date] = item;
    }
  });

  return Object.values(groupedResults).sort((a, b) => new Date(b.date) - new Date(a.date));
};

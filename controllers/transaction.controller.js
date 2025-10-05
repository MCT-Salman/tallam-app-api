import { serializeResponse } from "../utils/serialize.js";
import {
  getTransactions,
  getTransactionById,
  getTransactionStats,
  getTransactionsByDate
} from "../services/transaction.service.js";

/**
 * Get all transactions with filtering and pagination (Admin only)
 * GET /api/admin/transactions
 */
export const adminGetTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      accessCodeId,
      couponId,
      minAmount,
      maxAmount,
      startDate,
      endDate
    } = req.query;

    const filters = {
      accessCodeId,
      couponId,
      minAmount,
      maxAmount,
      startDate,
      endDate
    };

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const sorting = {
      sortBy,
      sortOrder
    };

    const result = await getTransactions(filters, pagination, sorting);

    res.json({
      success: true,
      message: "تم جلب المعاملات بنجاح",
      data: {
        transactions: serializeResponse(result.transactions),
        pagination: result.pagination
      }
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

/**
 * Get a specific transaction by ID (Admin only)
 * GET /api/admin/transactions/:id
 */
export const adminGetTransaction = async (req, res, next) => {
  try {
    const transactionId = parseInt(req.params.id, 10);

    const transaction = await getTransactionById(transactionId);

    res.json({
      success: true,
      message: "تم جلب المعاملة بنجاح",
      data: serializeResponse(transaction)
    });
  } catch (error) {
    error.statusCode = error.statusCode || 404;
    next(error);
  }
};

/**
 * Get transaction statistics (Admin only)
 * GET /api/admin/transactions/stats
 */
export const adminGetTransactionStats = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate
    } = req.query;

    const filters = {
      startDate,
      endDate
    };

    const stats = await getTransactionStats(filters);

    res.json({
      success: true,
      message: "تم جلب إحصائيات المعاملات بنجاح",
      data: stats
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

/**
 * Get transactions grouped by date (Admin only)
 * GET /api/admin/transactions/analytics
 */
export const adminGetTransactionsByDate = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      groupBy = 'day'
    } = req.query;

    const filters = {
      startDate,
      endDate
    };

    const transactions = await getTransactionsByDate(filters, groupBy);

    res.json({
      success: true,
      message: "تم جلب تحليل المعاملات بالتاريخ بنجاح",
      data: {
        transactions,
        groupBy
      }
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

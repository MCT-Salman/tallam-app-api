import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import {
  adminGetTransactions,
  adminGetTransaction,
  adminGetTransactionStats,
  adminGetTransactionsByDate
} from "../controllers/transaction.controller.js";
import {
  transactionIdParam,
  transactionListValidationRules,
  transactionAnalyticsValidationRules
} from "../validators/transaction.validators.js";

const router = Router();

// All transaction routes require authentication and admin role
router.use(requireAuth);
router.use(requireRole(['ADMIN']));

// Get all transactions with filtering and pagination
router.get("/", adminGetTransactions);

// Get a specific transaction by ID
router.get("/:id", validate(transactionIdParam), adminGetTransaction);

// Get transaction statistics
router.get("/stats/overview", validate(transactionAnalyticsValidationRules), adminGetTransactionStats);

// Get transactions grouped by date for analytics
router.get("/analytics/date", validate(transactionAnalyticsValidationRules), adminGetTransactionsByDate);

export default router;

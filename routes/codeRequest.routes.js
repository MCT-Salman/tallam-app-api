import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as CodeRequestController from '../controllers/codeRequest.controller.js';
import { createCodeRequestRules, updateCodeRequestStatusRules } from '../validators/codeRequest.validators.js';
import { idParam } from '../validators/catalog.validators.js';

const router = Router();

// --- Student Routes ---
router.post('/', requireAuth, requireRole(['STUDENT']), validate(createCodeRequestRules), CodeRequestController.studentCreateCodeRequest);
router.get('/my-requests', requireAuth, requireRole(['STUDENT']), CodeRequestController.studentGetMyCodeRequests);

// --- Admin Routes ---
router.get('/admin', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), CodeRequestController.adminGetAllCodeRequests);
router.patch('/admin/:id/status', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(idParam), validate(updateCodeRequestStatusRules), CodeRequestController.adminUpdateCodeRequestStatus);

export default router;
 
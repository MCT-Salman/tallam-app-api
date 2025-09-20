import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as AccessCodeController from '../controllers/accessCode.controller.js';
import { generateCodesRules, activateCodeRules } from '../validators/accessCode.validators.js';
import { courseIdParam } from '../validators/catalog.validators.js';

const router = Router();

// --- Admin Routes ---
router.post('/admin/generate', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(generateCodesRules), AccessCodeController.adminGenerateCodes);
router.get('/admin/course/:courseId', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(courseIdParam), AccessCodeController.adminGetCourseCodes);

// --- Student Routes ---
router.post('/activate', requireAuth, requireRole(['STUDENT']), validate(activateCodeRules), AccessCodeController.studentActivateCode);

export default router; 
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadNoticeImage } from '../middlewares/upload.middleware.js';
import {
  adminGenerateCodes, adminGetAllCodes, adminGetCourseCodes, adminGetCodesByUserId, adminUpdateAccessCode, adminToggleAccessCode, adminDeleteAccessCode, adminGetaccessCodesReport,
  studentGetMyCodes, studentGetMyCourses, studentActivateCode, studentGetExpiredCourses
} from '../controllers/accessCode.controller.js';
import { generateCodesRules, activateCodeRules } from '../validators/accessCode.validators.js';
import { idParam, courseIdParam, courseLevelIdParam } from '../validators/catalog.validators.js';

const router = Router();

// --- Admin Routes ---
router.post('/admin/generate', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), uploadNoticeImage.single('receiptImageUrl'), validate(generateCodesRules), adminGenerateCodes);
router.get('/admin/course/:courseId', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(courseIdParam), adminGetCourseCodes);
router.get('/admin/all', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), adminGetAllCodes);
router.get('/admin/user/:id', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(idParam), adminGetCodesByUserId);
router.put('/admin/access-code/:id', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), uploadNoticeImage.single('receiptImageUrl'), validate(idParam), adminUpdateAccessCode);
router.put('/admin/access-code/:id/active', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(idParam), adminToggleAccessCode);
router.delete('/admin/access-code/:id', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(idParam), adminDeleteAccessCode);
router.get('/admin/report', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), adminGetaccessCodesReport);

// --- Student Routes ---
router.get('/my-codes', requireAuth, requireRole(['STUDENT']), studentGetMyCodes);
router.get('/my-courses', requireAuth, requireRole(['STUDENT']), studentGetMyCourses);
router.post('/activate/level/:courseLevelId', requireAuth, requireRole(['STUDENT']), validate(courseLevelIdParam), validate(activateCodeRules), studentActivateCode);
router.get('/my-courses/expired', requireAuth, requireRole(['STUDENT']), studentGetExpiredCourses);

export default router;
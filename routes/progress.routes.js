import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ProgressController from '../controllers/progress.controller.js';
import { courseIdParam } from '../validators/catalog.validators.js';
import { param } from 'express-validator';

const router = Router();

// All routes are for authenticated students
router.use(requireAuth, requireRole(['STUDENT']));

const lessonIdParam = param('lessonId').isInt({ gt: 0 }).withMessage('معرف الدرس غير صالح');

router.post(
  '/lessons/:lessonId/complete',
  validate(lessonIdParam),
  ProgressController.studentMarkLessonComplete
);

router.get('/courses/:courseId',
  validate(courseIdParam),
  ProgressController.studentGetCourseProgress);

export default router;

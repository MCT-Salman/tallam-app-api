import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as StudentQuizController from '../controllers/student.quiz.controller.js';
import { idParam } from '../validators/catalog.validators.js';
import { submitQuizRules } from '../validators/quiz.validators.js';

const router = Router();

// All routes are for authenticated students
router.use(requireAuth, requireRole(['STUDENT']));

// Get a quiz by level id
router.get('/levels/:id',validate(idParam),StudentQuizController.studentGetQuizByLevel);

// Get a quiz to start taking it
router.get('/:id/start',validate(idParam),StudentQuizController.studentGetQuiz);

// Submit quiz answers
router.post('/:id/submit',validate(idParam),validate(submitQuizRules),StudentQuizController.studentSubmitQuiz);

export default router;

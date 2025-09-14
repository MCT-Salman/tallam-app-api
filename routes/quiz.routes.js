import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as QuizController from '../controllers/quiz.controller.js';
import { idParam, courseIdParam } from '../validators/catalog.validators.js';
import { createQuizRules, createQuestionRules, quizIdParam, createOptionRules } from '../validators/quiz.validators.js';

const router = Router();

// All routes are for admins
router.use(requireAuth, requireRole(['ADMIN', 'SUBADMIN']));

// --- Quiz Routes ---
router.post('/courses/:courseId/quizzes', validate(courseIdParam), validate(createQuizRules), QuizController.adminCreateQuiz);
router.get('/courses/:courseId/quizzes', validate(courseIdParam), QuizController.adminGetQuizByCourse);
router.get('/quizzes/:id', validate(idParam), QuizController.adminGetQuiz);
router.put('/quizzes/:id', validate(idParam), validate(createQuizRules), QuizController.adminUpdateQuiz);
router.delete('/quizzes/:id', validate(idParam), QuizController.adminDeleteQuiz);

// --- Question Routes ---
router.post(
  '/quizzes/:quizId/questions',
  validate(quizIdParam),
  validate(createQuestionRules),
  QuizController.adminAddQuestion
);
router.put(
  '/questions/:id',
  validate(idParam),
  validate(createQuestionRules),
  QuizController.adminUpdateQuestion
);
router.delete('/questions/:id', validate(idParam), QuizController.adminDeleteQuestion);

// --- Option Routes ---
router.put('/options/:id', validate(idParam), validate(createOptionRules), QuizController.adminUpdateOption);
router.delete('/options/:id', validate(idParam), QuizController.adminDeleteOption);

export default router;


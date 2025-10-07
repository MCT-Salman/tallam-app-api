import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as QuizController from '../controllers/quiz.controller.js';
import { idParam, courseLevelIdParam } from '../validators/catalog.validators.js';
import { createQuestionRules, updateQuestionRules, createOptionRules, updateOptionRules } from '../validators/quiz.validators.js';

const router = Router();

// All routes are for admins
router.use(requireAuth, requireRole(['ADMIN', 'SUBADMIN']));

// --- Quiz Routes ---
router.get('/courselevels/:courseLevelId/questions', validate(courseLevelIdParam), QuizController.adminGetQuizByCourse);
router.delete('/courselevels/:courseLevelId', validate(courseLevelIdParam), QuizController.adminDeleteQuiz);

// --- Question Routes ---
router.post('/courselevels/:courseLevelId/questions', validate(courseLevelIdParam), validate(createQuestionRules), QuizController.adminAddQuestion);
router.put('/questions/:id', validate(idParam), validate(updateQuestionRules), QuizController.adminUpdateQuestion);
router.delete('/questions/:id', validate(idParam), QuizController.adminDeleteQuestion);

// --- Option Routes ---
router.put('/options/:id', validate(idParam), validate(updateOptionRules), QuizController.adminUpdateOption);
router.delete('/options/:id', validate(idParam), QuizController.adminDeleteOption);

export default router;


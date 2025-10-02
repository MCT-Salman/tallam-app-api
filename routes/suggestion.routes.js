import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { studentCreateSuggestion, adminListSuggestions, adminGetSuggestion } from '../controllers/suggestion.controller.js';
import { studentCreateSuggestionRules, suggestionIdParam, adminListSuggestionQuery } from '../validators/suggestion.validators.js';

const router = Router();

// Student
router.post('/', requireAuth, requireRole(['STUDENT']), validate(studentCreateSuggestionRules), studentCreateSuggestion);

// Admin
router.get('/admin', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(adminListSuggestionQuery), adminListSuggestions);
router.get('/admin/:id', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(suggestionIdParam), adminGetSuggestion);

export default router;

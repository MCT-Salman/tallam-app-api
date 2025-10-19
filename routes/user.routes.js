import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as UserController from '../controllers/user.controller.js';
import { idParam } from '../validators/catalog.validators.js';
import { adminCreateUserRules, adminUpdateUserRules } from '../validators/user.validators.js';

const router = Router();

// All routes in this file are for admins
router.use(requireAuth, requireRole(['ADMIN', 'SUBADMIN']));

router.get('/', UserController.adminGetAllUsers);
router.post('/', validate(adminCreateUserRules), UserController.adminCreateUser);

router.get('/:id', validate(idParam), UserController.adminGetUserById);
router.put('/:id', validate(idParam), validate(adminUpdateUserRules), UserController.adminUpdateUser);
router.delete('/:id', validate(idParam), UserController.adminDeleteUser);
router.put('/:id/toggle-active', validate(idParam), UserController.adminToggleUserActive);

export default router;

import { Router } from 'express';
import { userController } from '../controllers';
import { authenticate, isAdmin, validate } from '../middlewares';
import {
  getUsersValidation,
  userIdValidation,
  updateUserRoleValidation,
  updateUserStatusValidation,
} from '../validators';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, isAdmin);

// GET /api/users - Get all users (paginated)
router.get('/', validate(getUsersValidation), userController.getUsers);

// GET /api/users/stats - Get user statistics
router.get('/stats', userController.getUserStats);

// GET /api/users/:id - Get user by ID
router.get('/:id', validate(userIdValidation), userController.getUserById);

// PATCH /api/users/:id/role - Update user role
router.patch(
  '/:id/role',
  validate(updateUserRoleValidation),
  userController.updateUserRole
);

// PATCH /api/users/:id/status - Update user status
router.patch(
  '/:id/status',
  validate(updateUserStatusValidation),
  userController.updateUserStatus
);

export default router;

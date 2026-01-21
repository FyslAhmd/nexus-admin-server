import { Router } from 'express';
import { authController } from '../controllers';
import { authenticate, isAdmin, validate } from '../middlewares';
import {
  loginValidation,
  createInviteValidation,
  verifyInviteValidation,
  registerViaInviteValidation,
} from '../validators';

const router = Router();

// POST /api/auth/login - Login user
router.post('/login', validate(loginValidation), authController.login);

// POST /api/auth/invite - Create invite (Admin only)
router.post(
  '/invite',
  authenticate,
  isAdmin,
  validate(createInviteValidation),
  authController.createInvite
);

// GET /api/auth/verify-invite/:token - Verify invite token
router.get(
  '/verify-invite/:token',
  validate(verifyInviteValidation),
  authController.verifyInvite
);

// POST /api/auth/register-via-invite - Register via invite
router.post(
  '/register-via-invite',
  validate(registerViaInviteValidation),
  authController.registerViaInvite
);

// GET /api/auth/me - Get current user
router.get('/me', authenticate, authController.getCurrentUser);

export default router;

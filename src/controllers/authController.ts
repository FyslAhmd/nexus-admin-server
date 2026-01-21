import { Response, NextFunction } from 'express';
import { authService } from '../services';
import { AuthRequest } from '../types';

class AuthController {
  // POST /api/auth/login
  async login(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, token } = await authService.login(req.body);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/invite (Admin only)
  async createInvite(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const invite = await authService.createInvite(req.body);

      // Generate invite link
      const inviteLink = `${process.env.FRONTEND_URL}/register?token=${invite.token}`;

      res.status(201).json({
        success: true,
        message: 'Invitation created successfully',
        data: {
          invite: {
            id: invite._id,
            email: invite.email,
            role: invite.role,
            expiresAt: invite.expiresAt,
          },
          inviteToken: invite.token,
          inviteLink,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/verify-invite/:token
  async verifyInvite(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = req.params;
      const invite = await authService.verifyInvite(token);

      res.status(200).json({
        success: true,
        message: 'Invitation is valid',
        data: {
          email: invite.email,
          role: invite.role,
          expiresAt: invite.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/register-via-invite
  async registerViaInvite(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, token } = await authService.registerViaInvite(req.body);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/me
  async getCurrentUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await authService.getCurrentUser(req.user!.userId);

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

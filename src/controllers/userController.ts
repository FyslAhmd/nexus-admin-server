import { Response, NextFunction } from 'express';
import { userService } from '../services';
import { AuthRequest, UserRole, UserStatus } from '../types';

class UserController {
  // GET /api/users
  async getUsers(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit, search, role, status } = req.query;

      const result = await userService.getUsers({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string | undefined,
        role: role as UserRole | undefined,
        status: status as UserStatus | undefined,
      });

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/users/:id
  async getUserById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/users/:id/role
  async updateUserRole(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.updateUserRole(
        id,
        req.body,
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/users/:id/status
  async updateUserStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.updateUserStatus(
        id,
        req.body,
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        message: `User ${user.status === UserStatus.ACTIVE ? 'activated' : 'deactivated'} successfully`,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/users/stats
  async getUserStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await userService.getUserStats();

      res.status(200).json({
        success: true,
        message: 'User stats retrieved successfully',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();

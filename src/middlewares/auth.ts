import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { AuthRequest, JwtPayload, UserRole } from '../types';
import { User } from '../models';
import { UnauthorizedError, ForbiddenError } from '../utils/AppError';

// Verify JWT token and attach user to request
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided. Please log in.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('No token provided. Please log in.');
    }

    // Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token has expired. Please log in again.');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid token. Please log in again.');
      }
      throw new UnauthorizedError('Token verification failed.');
    }

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError('User no longer exists.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError(
        'Your account has been deactivated. Please contact an administrator.'
      );
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Role-based access control middleware
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required.');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError(
          'You do not have permission to perform this action.'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Check if user is admin
export const isAdmin = authorize(UserRole.ADMIN);

// Check if user is admin or manager
export const isAdminOrManager = authorize(UserRole.ADMIN, UserRole.MANAGER);

import { body, param, query } from 'express-validator';
import { UserRole, UserStatus } from '../types';
import mongoose from 'mongoose';

// Validate MongoDB ObjectId
const isValidObjectId = (value: string) => mongoose.Types.ObjectId.isValid(value);

// Get users query validation
export const getUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters'),
  query('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Role must be ADMIN, MANAGER, or STAFF'),
  query('status')
    .optional()
    .isIn(Object.values(UserStatus))
    .withMessage('Status must be ACTIVE or INACTIVE'),
];

// User ID param validation
export const userIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid user ID format'),
];

// Update user role validation
export const updateUserRoleValidation = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid user ID format'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(UserRole))
    .withMessage('Role must be ADMIN, MANAGER, or STAFF'),
];

// Update user status validation
export const updateUserStatusValidation = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid user ID format'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(UserStatus))
    .withMessage('Status must be ACTIVE or INACTIVE'),
];

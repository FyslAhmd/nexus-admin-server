import { body, param } from 'express-validator';
import { UserRole } from '../types';

// Login validation
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail({ gmail_remove_dots: false }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Create invite validation
export const createInviteValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail({ gmail_remove_dots: false }),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(UserRole))
    .withMessage('Role must be ADMIN, MANAGER, or STAFF'),
];

// Verify invite token validation
export const verifyInviteValidation = [
  param('token')
    .notEmpty()
    .withMessage('Invite token is required')
    .isLength({ min: 64, max: 64 })
    .withMessage('Invalid invite token format'),
];

// Register via invite validation
export const registerViaInviteValidation = [
  body('token')
    .notEmpty()
    .withMessage('Invite token is required')
    .isLength({ min: 64, max: 64 })
    .withMessage('Invalid invite token format'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
];

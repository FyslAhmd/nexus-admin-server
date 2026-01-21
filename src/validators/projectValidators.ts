import { body, param, query } from 'express-validator';
import { ProjectStatus } from '../types';
import mongoose from 'mongoose';

// Validate MongoDB ObjectId
const isValidObjectId = (value: string) => mongoose.Types.ObjectId.isValid(value);

// Create project validation
export const createProjectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

// Get projects query validation
export const getProjectsValidation = [
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
  query('status')
    .optional()
    .isIn([ProjectStatus.ACTIVE, ProjectStatus.ARCHIVED])
    .withMessage('Status must be ACTIVE or ARCHIVED'),
  query('includeDeleted')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeDeleted must be true or false'),
];

// Project ID param validation
export const projectIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Project ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid project ID format'),
];

// Update project validation
export const updateProjectValidation = [
  param('id')
    .notEmpty()
    .withMessage('Project ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid project ID format'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn([ProjectStatus.ACTIVE, ProjectStatus.ARCHIVED])
    .withMessage('Status must be ACTIVE or ARCHIVED'),
];

import { Router } from 'express';
import { projectController } from '../controllers';
import { authenticate, isAdmin, validate } from '../middlewares';
import {
  createProjectValidation,
  getProjectsValidation,
  projectIdValidation,
  updateProjectValidation,
} from '../validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/projects/stats - Get project statistics
router.get('/stats', projectController.getProjectStats);

// POST /api/projects - Create project (all authenticated users)
router.post('/', validate(createProjectValidation), projectController.createProject);

// GET /api/projects - Get all projects (paginated)
router.get('/', validate(getProjectsValidation), projectController.getProjects);

// GET /api/projects/:id - Get project by ID
router.get('/:id', validate(projectIdValidation), projectController.getProjectById);

// PATCH /api/projects/:id - Update project (Admin only)
router.patch(
  '/:id',
  isAdmin,
  validate(updateProjectValidation),
  projectController.updateProject
);

// DELETE /api/projects/:id - Soft delete project (Admin only)
router.delete(
  '/:id',
  isAdmin,
  validate(projectIdValidation),
  projectController.deleteProject
);

export default router;

import { Response, NextFunction } from 'express';
import { projectService } from '../services';
import { AuthRequest, ProjectStatus } from '../types';

class ProjectController {
  // POST /api/projects
  async createProject(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const project = await projectService.createProject(
        req.body,
        req.user!.userId
      );

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/projects
  async getProjects(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit, search, status, includeDeleted } = req.query;

      const result = await projectService.getProjects({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string | undefined,
        status: status as ProjectStatus | undefined,
        includeDeleted: includeDeleted === 'true',
      });

      res.status(200).json({
        success: true,
        message: 'Projects retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/projects/:id
  async getProjectById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);

      res.status(200).json({
        success: true,
        message: 'Project retrieved successfully',
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/projects/:id (Admin only)
  async updateProject(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const project = await projectService.updateProject(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/projects/:id (Admin only - soft delete)
  async deleteProject(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const project = await projectService.deleteProject(id);

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/projects/stats
  async getProjectStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await projectService.getProjectStats();

      res.status(200).json({
        success: true,
        message: 'Project stats retrieved successfully',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProjectController();

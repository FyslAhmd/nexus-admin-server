import { Project } from '../models';
import { IProjectDocument } from '../models/Project';
import {
  ProjectStatus,
  CreateProjectBody,
  UpdateProjectBody,
  PaginatedResponse,
} from '../types';
import { NotFoundError, ForbiddenError } from '../utils/AppError';

interface GetProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  includeDeleted?: boolean;
}

class ProjectService {
  // Create project
  async createProject(
    data: CreateProjectBody,
    userId: string
  ): Promise<IProjectDocument> {
    const project = await Project.create({
      ...data,
      createdBy: userId,
    });

    // Populate creator info
    await project.populate('createdBy', 'name email');

    return project;
  }

  // Get all projects with pagination
  async getProjects(
    params: GetProjectsParams
  ): Promise<PaginatedResponse<IProjectDocument>> {
    const { page = 1, limit = 10, search, status, includeDeleted = false } =
      params;

    // Build query
    const query: any = {};

    // By default, exclude deleted projects
    if (!includeDeleted) {
      query.isDeleted = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [projects, totalCount] = await Promise.all([
      Project.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      items: projects,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // Get project by ID
  async getProjectById(projectId: string): Promise<IProjectDocument> {
    const project = await Project.findById(projectId).populate(
      'createdBy',
      'name email'
    );

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (project.isDeleted) {
      throw new NotFoundError('Project not found');
    }

    return project;
  }

  // Update project (Admin only)
  async updateProject(
    projectId: string,
    data: UpdateProjectBody
  ): Promise<IProjectDocument> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (project.isDeleted) {
      throw new NotFoundError('Project not found');
    }

    // Update fields
    if (data.name !== undefined) project.name = data.name;
    if (data.description !== undefined) project.description = data.description;
    if (data.status !== undefined) project.status = data.status;

    await project.save();
    await project.populate('createdBy', 'name email');

    return project;
  }

  // Soft delete project (Admin only)
  async deleteProject(projectId: string): Promise<IProjectDocument> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (project.isDeleted) {
      throw new NotFoundError('Project not found');
    }

    // Soft delete
    project.isDeleted = true;
    project.status = ProjectStatus.DELETED;
    await project.save();
    await project.populate('createdBy', 'name email');

    return project;
  }

  // Get project stats (for dashboard)
  async getProjectStats(): Promise<{
    total: number;
    active: number;
    archived: number;
    deleted: number;
  }> {
    const [total, active, archived, deleted] = await Promise.all([
      Project.countDocuments({ isDeleted: false }),
      Project.countDocuments({ status: ProjectStatus.ACTIVE, isDeleted: false }),
      Project.countDocuments({
        status: ProjectStatus.ARCHIVED,
        isDeleted: false,
      }),
      Project.countDocuments({ isDeleted: true }),
    ]);

    return { total, active, archived, deleted };
  }
}

export default new ProjectService();

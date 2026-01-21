import { User } from '../models';
import { IUserDocument } from '../models/User';
import {
  UserRole,
  UserStatus,
  UpdateUserRoleBody,
  UpdateUserStatusBody,
  PaginatedResponse,
} from '../types';
import { NotFoundError, BadRequestError } from '../utils/AppError';

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

class UserService {
  // Get all users with pagination
  async getUsers(
    params: GetUsersParams
  ): Promise<PaginatedResponse<IUserDocument>> {
    const { page = 1, limit = 10, search, role, status } = params;

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [users, totalCount] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      items: users,
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

  // Get user by ID
  async getUserById(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  // Update user role
  async updateUserRole(
    userId: string,
    data: UpdateUserRoleBody,
    requestingUserId: string
  ): Promise<IUserDocument> {
    const { role } = data;

    // Prevent admin from changing their own role
    if (userId === requestingUserId) {
      throw new BadRequestError('You cannot change your own role');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.role = role;
    await user.save();

    return user;
  }

  // Update user status
  async updateUserStatus(
    userId: string,
    data: UpdateUserStatusBody,
    requestingUserId: string
  ): Promise<IUserDocument> {
    const { status } = data;

    // Prevent admin from deactivating themselves
    if (userId === requestingUserId && status === UserStatus.INACTIVE) {
      throw new BadRequestError('You cannot deactivate your own account');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.status = status;
    await user.save();

    return user;
  }

  // Get user stats (for dashboard)
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: { role: string; count: number }[];
  }> {
    const [total, active, inactive, byRole] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: UserStatus.ACTIVE }),
      User.countDocuments({ status: UserStatus.INACTIVE }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $project: { role: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    return { total, active, inactive, byRole };
  }
}

export default new UserService();

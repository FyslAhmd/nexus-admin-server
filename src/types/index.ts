import { Request } from 'express';

// User roles enum
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

// User status enum
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// Project status enum
export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

// User interface
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  invitedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Invite interface
export interface IInvite {
  _id: string;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

// Project interface
export interface IProject {
  _id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  isDeleted: boolean;
  createdBy: string | IUser;
  createdAt: Date;
  updatedAt: Date;
}

// JWT Payload interface
export interface JwtPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Extended Request with user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Login request body
export interface LoginBody {
  email: string;
  password: string;
}

// Invite request body
export interface CreateInviteBody {
  email: string;
  role: UserRole;
}

// Register via invite request body
export interface RegisterViaInviteBody {
  token: string;
  name: string;
  password: string;
}

// Create project request body
export interface CreateProjectBody {
  name: string;
  description?: string;
}

// Update project request body
export interface UpdateProjectBody {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

// Update user role request body
export interface UpdateUserRoleBody {
  role: UserRole;
}

// Update user status request body
export interface UpdateUserStatusBody {
  status: UserStatus;
}

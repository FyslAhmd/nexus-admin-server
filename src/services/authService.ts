import jwt from 'jsonwebtoken';
import config from '../config';
import { User, Invite } from '../models';
import { IUserDocument } from '../models/User';
import { IInviteDocument } from '../models/Invite';
import {
  UserRole,
  UserStatus,
  LoginBody,
  CreateInviteBody,
  RegisterViaInviteBody,
} from '../types';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../utils/AppError';
import emailService from './emailService';

class AuthService {
  // Generate JWT token
  generateToken(userId: string, role: UserRole): string {
    return jwt.sign(
      { userId, role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );
  }

  // Login user
  async login(data: LoginBody): Promise<{ user: IUserDocument; token: string }> {
    const { email, password } = data;

    console.log('Login attempt for:', email);

    // Find user by email and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User password exists:', !!user.password);
      console.log('User status:', user.status);
    }

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError(
        'Your account has been deactivated. Please contact an administrator.'
      );
    }

    // Verify password
    console.log('Comparing password...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user._id.toString(), user.role);

    // Return user without password
    const userWithoutPassword = await User.findById(user._id);

    return { user: userWithoutPassword!, token };
  }

  // Create invite (Admin only)
  async createInvite(data: CreateInviteBody): Promise<IInviteDocument> {
    const { email, role } = data;

    // Check if user with this email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    // Check if there's already a valid (pending) invite for this email
    const existingInvite = await Invite.findValidByEmail(email);
    if (existingInvite) {
      throw new ConflictError(
        'A pending invitation already exists for this email'
      );
    }

    // Generate invite token
    const token = Invite.generateToken();

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.inviteTokenExpiresHours);

    // Create invite
    const invite = await Invite.create({
      email: email.toLowerCase(),
      role,
      token,
      expiresAt,
    });

    // Send invitation email
    await emailService.sendInviteEmail(invite.email, invite.token, invite.role);

    return invite;
  }

  // Verify invite token
  async verifyInvite(token: string): Promise<IInviteDocument> {
    const invite = await Invite.findByToken(token);

    if (!invite) {
      throw new NotFoundError('Invalid invitation token');
    }

    if (invite.isAccepted()) {
      throw new BadRequestError('This invitation has already been used');
    }

    if (invite.isExpired()) {
      throw new BadRequestError(
        'This invitation has expired. Please request a new one.'
      );
    }

    return invite;
  }

  // Register via invite
  async registerViaInvite(
    data: RegisterViaInviteBody
  ): Promise<{ user: IUserDocument; token: string }> {
    const { token, name, password } = data;

    // Verify invite token
    const invite = await this.verifyInvite(token);

    // Check if user with this email already exists (shouldn't happen but double check)
    const existingUser = await User.findByEmail(invite.email);
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email: invite.email,
      password,
      role: invite.role,
      status: UserStatus.ACTIVE,
      invitedAt: invite.createdAt,
    });

    // Mark invite as accepted
    invite.acceptedAt = new Date();
    await invite.save();

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.name);

    // Generate token
    const jwtToken = this.generateToken(user._id.toString(), user.role);

    return { user, token: jwtToken };
  }

  // Get current user
  async getCurrentUser(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}

export default new AuthService();

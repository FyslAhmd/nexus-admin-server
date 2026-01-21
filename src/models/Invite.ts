import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';
import { IInvite, UserRole } from '../types';

// Invite document interface
export interface IInviteDocument extends Omit<IInvite, '_id'>, Document {
  isExpired(): boolean;
  isAccepted(): boolean;
}

// Invite model interface
export interface IInviteModel extends Model<IInviteDocument> {
  findByToken(token: string): Promise<IInviteDocument | null>;
  findValidByEmail(email: string): Promise<IInviteDocument | null>;
  generateToken(): string;
}

const inviteSchema = new Schema<IInviteDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        'Please provide a valid email address',
      ],
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: 'Role must be ADMIN, MANAGER, or STAFF',
      },
      required: [true, 'Role is required'],
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for compound queries (token already has unique index from schema)
inviteSchema.index({ email: 1, acceptedAt: 1 });

// Check if invite is expired
inviteSchema.methods.isExpired = function (): boolean {
  return new Date() > this.expiresAt;
};

// Check if invite is already accepted
inviteSchema.methods.isAccepted = function (): boolean {
  return this.acceptedAt !== null;
};

// Static method to find invite by token
inviteSchema.statics.findByToken = function (token: string) {
  return this.findOne({ token });
};

// Static method to find valid (pending) invite by email
inviteSchema.statics.findValidByEmail = function (email: string) {
  return this.findOne({
    email: email.toLowerCase(),
    acceptedAt: null,
    expiresAt: { $gt: new Date() },
  });
};

// Static method to generate secure token
inviteSchema.statics.generateToken = function (): string {
  return crypto.randomBytes(32).toString('hex');
};

// Remove __v when converting to JSON
inviteSchema.methods.toJSON = function () {
  const invite = this.toObject();
  delete invite.__v;
  return invite;
};

const Invite = mongoose.model<IInviteDocument, IInviteModel>('Invite', inviteSchema);

export default Invite;

import mongoose, { Schema, Document, Model } from 'mongoose';
import { IProject, ProjectStatus } from '../types';

// Project document interface
export interface IProjectDocument extends Omit<IProject, '_id'>, Document {}

// Project model interface
export interface IProjectModel extends Model<IProjectDocument> {
  findActiveProjects(): Promise<IProjectDocument[]>;
}

const projectSchema = new Schema<IProjectDocument>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters'],
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: Object.values(ProjectStatus),
        message: 'Status must be ACTIVE, ARCHIVED, or DELETED',
      },
      default: ProjectStatus.ACTIVE,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
projectSchema.index({ isDeleted: 1, status: 1 });
projectSchema.index({ createdBy: 1 });

// Static method to find non-deleted projects
projectSchema.statics.findActiveProjects = function () {
  return this.find({ isDeleted: false }).populate('createdBy', 'name email');
};

// Remove __v when converting to JSON
projectSchema.methods.toJSON = function () {
  const project = this.toObject();
  delete project.__v;
  return project;
};

const Project = mongoose.model<IProjectDocument, IProjectModel>('Project', projectSchema);

export default Project;

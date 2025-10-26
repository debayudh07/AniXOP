import mongoose, { Schema, Document } from 'mongoose';

export interface LessonProgress {
  conceptId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number; // 0-100
  lastOpenedAt: Date;
  completedAt?: Date;
  timeSpent: number; // in minutes
  quizScore?: number; // 0-100
  content?: any; // Cached generated content
}

export interface IUser extends Document {
  email: string;
  password: string;
  username?: string;
  // Learning stats
  totalTimeSpent: number; // in minutes
  totalConceptsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  lessonProgress: LessonProgress[];
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LessonProgressSchema = new Schema(
  {
    conceptId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastOpenedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    quizScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    content: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    username: {
      type: String,
      trim: true,
    },
    // Learning stats
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
    totalConceptsCompleted: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    lessonProgress: {
      type: [LessonProgressSchema],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Remove password from JSON output
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model<IUser>('User', UserSchema);


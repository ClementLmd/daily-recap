import mongoose, { Document, Schema } from "mongoose";
import argon2 from "argon2";

export interface ProgressEntry {
  value: number;
  date: Date;
  notes?: string;
}

export interface Activity {
  _id: string;
  name: string;
  progress: ProgressEntry[];
  count: number;
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  activities: Activity[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  failedLoginAttempts: number;
  lastFailedLoginAt: Date;
  isLocked: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  addActivity(name: string): Promise<IUser>;
  addProgress(activityName: string, value: number, notes?: string): Promise<IUser>;
  getProgressInRange(activityName: string, startDate: Date, endDate: Date): ProgressEntry[];
}

const progressEntrySchema = new Schema<ProgressEntry>({
  value: {
    type: Number,
    required: [true, "Progress value is required"],
    min: [0, "Progress value cannot be negative"],
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
  },
});

const activitySchema = new Schema<Activity>({
  name: {
    type: String,
    required: [true, "Activity name is required"],
    trim: true,
  },
  progress: [progressEntrySchema],
  count: {
    type: Number,
    default: 0,
  },
});

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    activities: [activitySchema],
    lastLoginAt: {
      type: Date,
      default: null,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lastFailedLoginAt: {
      type: Date,
      default: null,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (error) {
    return false;
  }
};

// Add activity method
userSchema.methods.addActivity = async function (name: string): Promise<IUser> {
  // Check if activity with same name exists
  const existingActivity = this.activities.find((cat: Activity) => cat.name === name);
  if (existingActivity) {
    throw new Error("A activity with this name already exists");
  }

  this.activities.push({ name, progress: [] });
  return this.save();
};

// Add progress method
userSchema.methods.addProgress = async function (
  activityName: string,
  value: number,
  notes?: string,
): Promise<IUser> {
  const activity = this.activities.find((cat: Activity) => cat.name === activityName);
  if (!activity) {
    throw new Error("Activity not found");
  }

  activity.progress.push({
    value,
    date: new Date(),
    notes,
  });

  return this.save();
};

// Get progress in range method
userSchema.methods.getProgressInRange = function (
  activityName: string,
  startDate: Date,
  endDate: Date,
): ProgressEntry[] {
  const activity = this.activities.find((cat: Activity) => cat.name === activityName);
  if (!activity) {
    throw new Error("Activity not found");
  }

  return activity.progress.filter(
    (entry: ProgressEntry) => entry.date >= startDate && entry.date <= endDate,
  );
};

export const User = mongoose.model<IUser>("User", userSchema);

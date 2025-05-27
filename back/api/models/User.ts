import mongoose, { Document, Schema } from "mongoose";
import argon2 from "argon2";

export interface ProgressEntry {
  value: number;
  date: Date;
  notes?: string;
}

export interface Category {
  _id: string;
  name: string;
  progress: ProgressEntry[];
  count: number;
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  categories: Category[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  failedLoginAttempts: number;
  lastFailedLoginAt: Date;
  isLocked: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  addCategory(name: string): Promise<IUser>;
  addProgress(categoryName: string, value: number, notes?: string): Promise<IUser>;
  getProgressInRange(categoryName: string, startDate: Date, endDate: Date): ProgressEntry[];
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

const categorySchema = new Schema<Category>({
  name: {
    type: String,
    required: [true, "Category name is required"],
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
    categories: [categorySchema],
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

// Add category method
userSchema.methods.addCategory = async function (name: string): Promise<IUser> {
  // Check if category with same name exists
  const existingCategory = this.categories.find((cat: Category) => cat.name === name);
  if (existingCategory) {
    throw new Error("A category with this name already exists");
  }

  this.categories.push({ name, progress: [] });
  return this.save();
};

// Add progress method
userSchema.methods.addProgress = async function (
  categoryName: string,
  value: number,
  notes?: string,
): Promise<IUser> {
  const category = this.categories.find((cat: Category) => cat.name === categoryName);
  if (!category) {
    throw new Error("Category not found");
  }

  category.progress.push({
    value,
    date: new Date(),
    notes,
  });

  return this.save();
};

// Get progress in range method
userSchema.methods.getProgressInRange = function (
  categoryName: string,
  startDate: Date,
  endDate: Date,
): ProgressEntry[] {
  const category = this.categories.find((cat: Category) => cat.name === categoryName);
  if (!category) {
    throw new Error("Category not found");
  }

  return category.progress.filter(
    (entry: ProgressEntry) => entry.date >= startDate && entry.date <= endDate,
  );
};

export const User = mongoose.model<IUser>("User", userSchema);

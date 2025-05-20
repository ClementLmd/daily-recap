import mongoose from "mongoose";

export interface ProgressEntry {
  value: number;
  date: Date;
  notes?: string;
}

export interface CategoryInterface {
  name: string;
  createdAt: Date;
  updatedAt: Date;
  progress: ProgressEntry[];
}

export interface CategoryDocument extends mongoose.Document, CategoryInterface {
  addProgress(value: number, notes?: string): Promise<CategoryDocument>;
  getProgressInRange(startDate: Date, endDate: Date): ProgressEntry[];
}

const progressEntrySchema = new mongoose.Schema<ProgressEntry>({
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

const categorySchema = new mongoose.Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    progress: [progressEntrySchema],
  },
  {
    timestamps: true,
  }
);

// Add method to record progress
categorySchema.methods.addProgress = async function (
  value: number,
  notes?: string
): Promise<CategoryDocument> {
  this.progress.push({
    value,
    date: new Date(),
    notes,
  });
  return this.save();
};

// Add method to get progress within a date range
categorySchema.methods.getProgressInRange = function (
  startDate: Date,
  endDate: Date
): ProgressEntry[] {
  return this.progress.filter(
    (entry: ProgressEntry) => entry.date >= startDate && entry.date <= endDate
  );
};

export const Category = mongoose.model<
  CategoryDocument,
  mongoose.Model<CategoryDocument>
>("Category", categorySchema);

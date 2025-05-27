import { User, ProgressEntry } from "../../models/User";

export const updateProgress = async (
  userId: string,
  categoryName: string,
  value: number,
  notes?: string,
) => {
  if (typeof value !== "number" || value < 0) {
    throw new Error("Progress value is required and must be a non-negative number");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const category = user.categories.find((cat) => cat.name === categoryName);

  if (!category) {
    throw new Error("Category not found");
  }

  const newProgress: ProgressEntry = {
    value,
    date: new Date(),
    notes,
  };

  // Update the total count
  category.count += value;
  category.progress.push(newProgress);
  await user.save();

  return category;
};

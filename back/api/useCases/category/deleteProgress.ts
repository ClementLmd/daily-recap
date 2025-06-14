import { User } from "../../models/User";

export const deleteProgress = async (
  userId: string,
  categoryName: string,
  progressIndex: number,
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const category = user.categories.find((cat) => cat.name === categoryName);
  if (!category) {
    throw new Error("Category not found");
  }

  // Sort progress by date, most recent first (same as frontend)
  const sortedProgress = [...category.progress].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (progressIndex < 0 || progressIndex >= sortedProgress.length) {
    throw new Error("Progress entry not found");
  }

  // Get the entry to delete from the sorted array
  const entryToDelete = sortedProgress[progressIndex];

  // Find the actual index in the original array
  const actualIndex = category.progress.findIndex(
    (entry) => entry.date === entryToDelete.date && entry.value === entryToDelete.value,
  );

  if (actualIndex === -1) {
    throw new Error("Progress entry not found");
  }

  // Subtract the value from the total count
  category.count -= category.progress[actualIndex].value;

  // Remove the progress entry
  category.progress.splice(actualIndex, 1);

  await user.save();

  return category;
};

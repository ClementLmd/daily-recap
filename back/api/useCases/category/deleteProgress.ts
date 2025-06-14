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

  if (progressIndex < 0 || progressIndex >= category.progress.length) {
    throw new Error("Progress entry not found");
  }

  // Subtract the value from the total count
  category.count -= category.progress[progressIndex].value;

  // Remove the progress entry
  category.progress.splice(progressIndex, 1);

  await user.save();

  return category;
};

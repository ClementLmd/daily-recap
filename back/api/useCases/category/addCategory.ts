import { User, Category } from "../../models/User";

export const addCategory = async (userId: string, name: string) => {
  if (!name) {
    throw new Error("Category name is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if category name already exists
  if (user.categories.some((cat) => cat.name === name)) {
    throw new Error("A category with this name already exists");
  }

  const newCategory: Category = {
    name: name.trim(),
    progress: [],
  };

  user.categories.push(newCategory);
  await user.save();

  return newCategory;
};

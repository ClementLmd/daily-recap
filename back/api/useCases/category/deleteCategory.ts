import { User } from "../../models/User";

export const deleteCategory = async (userId: string, categoryId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const categoryIndex = user.categories.findIndex((cat) => cat._id.toString() === categoryId);

  if (categoryIndex === -1) {
    throw new Error("Category not found");
  }

  user.categories.splice(categoryIndex, 1);
  await user.save();
};

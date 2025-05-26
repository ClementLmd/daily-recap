import { User } from "../../models/User";

export const deleteCategory = async (userId: string, categoryName: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const categoryIndex = user.categories.findIndex(
    (cat) => cat.name === categoryName
  );

  if (categoryIndex === -1) {
    throw new Error("Category not found");
  }

  user.categories.splice(categoryIndex, 1);
  await user.save();
};

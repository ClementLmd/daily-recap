import { User } from "../../models/User";

export const getCategories = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return user.categories;
};

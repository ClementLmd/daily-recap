import { User } from "../../models/User";

export const getActivities = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return user.activities;
};

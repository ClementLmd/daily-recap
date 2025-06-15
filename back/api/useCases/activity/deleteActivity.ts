import { User } from "../../models/User";

export const deleteActivity = async (userId: string, activityId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const activityIndex = user.activities.findIndex((act) => act._id.toString() === activityId);
  if (activityIndex === -1) {
    throw new Error("Activity not found");
  }

  user.activities.splice(activityIndex, 1);
  await user.save();
};

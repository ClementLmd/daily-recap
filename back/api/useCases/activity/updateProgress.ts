import { User } from "../../models/User";

export const updateProgress = async (
  userId: string,
  activityId: string,
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

  const activity = user.activities.find((act) => act._id.toString() === activityId);
  if (!activity) {
    throw new Error("Activity not found");
  }

  const newProgress = {
    date: new Date(),
    value,
    notes,
  };

  activity.count += value;
  activity.progress.push(newProgress);
  await user.save();

  return activity;
};

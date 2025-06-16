import { User, ProgressEntry } from "../../models/User";

export const updateProgress = async (
  userId: string,
  activityName: string,
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

  const activity = user.activities.find((cat) => cat.name === activityName);

  if (!activity) {
    throw new Error("Activity not found");
  }

  const newProgress: ProgressEntry = {
    value,
    date: new Date(),
    notes,
  };

  // Update the total count
  activity.count += value;
  activity.progress.push(newProgress);
  await user.save();

  return activity;
};

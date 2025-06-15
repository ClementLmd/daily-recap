import { User } from "../../models/User";

export const deleteProgress = async (userId: string, activityId: string, progressIndex: number) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const activity = user.activities.find((act) => act._id.toString() === activityId);
  if (!activity) {
    throw new Error("Activity not found");
  }

  // Sort progress entries by date in descending order
  const sortedProgress = [...activity.progress].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (progressIndex < 0 || progressIndex >= sortedProgress.length) {
    throw new Error("Progress entry not found");
  }

  // Find the actual index in the original array
  const actualIndex = activity.progress.findIndex(
    (entry) => entry.date.getTime() === sortedProgress[progressIndex].date.getTime(),
  );

  if (actualIndex === -1) {
    throw new Error("Progress entry not found");
  }

  // Update the total count
  activity.count -= activity.progress[actualIndex].value;

  // Remove the progress entry
  activity.progress.splice(actualIndex, 1);
  await user.save();

  return activity;
};

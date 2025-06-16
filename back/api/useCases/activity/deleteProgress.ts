import { User } from "../../models/User";

export const deleteProgress = async (
  userId: string,
  activityName: string,
  progressIndex: number,
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const activity = user.activities.find((cat) => cat.name === activityName);
  if (!activity) {
    throw new Error("Activity not found");
  }

  // Sort progress by date, most recent first (same as frontend)
  const sortedProgress = [...activity.progress].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (progressIndex < 0 || progressIndex >= sortedProgress.length) {
    throw new Error("Progress entry not found");
  }

  // Get the entry to delete from the sorted array
  const entryToDelete = sortedProgress[progressIndex];

  // Find the actual index in the original array
  const actualIndex = activity.progress.findIndex(
    (entry) => entry.date === entryToDelete.date && entry.value === entryToDelete.value,
  );

  if (actualIndex === -1) {
    throw new Error("Progress entry not found");
  }

  // Subtract the value from the total count
  activity.count -= activity.progress[actualIndex].value;

  // Remove the progress entry
  activity.progress.splice(actualIndex, 1);

  await user.save();

  return activity;
};

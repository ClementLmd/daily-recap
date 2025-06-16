import mongoose from "mongoose";
import { User, Activity } from "../../models/User";

export const addActivity = async (userId: string, name: string) => {
  if (!name) {
    throw new Error("Activity name is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if activity name already exists
  if (user.activities.some((cat) => cat.name === name)) {
    throw new Error("A activity with this name already exists");
  }

  const newActivity: Activity = {
    _id: new mongoose.Types.ObjectId().toString(),
    name: name.trim(),
    progress: [],
    count: 0,
  };

  user.activities.push(newActivity);
  await user.save();

  return newActivity;
};

import mongoose from "mongoose";
import { User } from "../../models/User";
import { Types } from "mongoose";

export const addActivity = async (userId: string, name: string) => {
  if (!name) {
    throw new Error("Activity name is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if activity name already exists
  if (user.activities.some((act) => act.name === name)) {
    throw new Error("An activity with this name already exists");
  }

  const newActivity = {
    _id: new Types.ObjectId(),
    name: name.trim(),
    count: 0,
    progress: [],
  };

  user.activities.push(newActivity);
  await user.save();

  return newActivity;
};

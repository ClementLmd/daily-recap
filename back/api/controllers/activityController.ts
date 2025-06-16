import { Request, Response } from "express";
import { IUser } from "../models/User";
import { getActivities } from "../useCases/activity/getActivities";
import { addActivity } from "../useCases/activity/addActivity";
import { deleteActivity } from "../useCases/activity/deleteActivity";
import { deleteProgress } from "../useCases/activity/deleteProgress";
import { updateProgress } from "../useCases/activity/updateProgress";

interface CustomError extends Error {
  message: string;
}

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const activityController = {
  // Get all activities for the authenticated user
  getActivities: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({
          status: "error",
          message: "User not authenticated",
        });
      }
      const activities = await getActivities(req.user._id.toString());
      res.json({
        status: "success",
        activities,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to get activities",
      });
    }
  },

  // Add a new activity
  addActivity: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({
          status: "error",
          message: "User not authenticated",
        });
      }
      const { name } = req.body as { name: string };
      const newActivity = await addActivity(req.user._id.toString(), name);

      res.status(201).json({
        status: "success",
        newActivity,
      });
    } catch (error) {
      const customError = error as CustomError;
      if (customError.message === "Activity name is required") {
        return res.status(400).json({
          status: "error",
          message: customError.message,
        });
      }
      if (customError.message === "A activity with this name already exists") {
        return res.status(409).json({
          status: "error",
          message: customError.message,
        });
      }
      res.status(500).json({
        status: "error",
        message: "Failed to add activity",
      });
    }
  },

  // Delete a activity
  deleteActivity: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({
          status: "error",
          message: "User not authenticated",
        });
      }
      const { activityId } = req.params as { activityId: string };
      await deleteActivity(req.user._id.toString(), activityId);

      res.json({
        status: "success",
        message: "Activity deleted successfully",
      });
    } catch (error) {
      const customError = error as CustomError;
      if (customError.message === "Activity not found") {
        return res.status(404).json({
          status: "error",
          message: customError.message,
        });
      }
      res.status(500).json({
        status: "error",
        message: "Failed to delete activity",
      });
    }
  },

  // Update activity progress
  updateProgress: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({
          status: "error",
          message: "User not authenticated",
        });
      }
      const { activityId } = req.params as { activityId: string };
      const { value, notes } = req.body as { value: number; notes?: string };

      const updatedActivity = await updateProgress(
        req.user._id.toString(),
        activityId,
        value,
        notes,
      );

      res.json({
        status: "success",
        updatedActivity,
      });
    } catch (error) {
      const customError = error as CustomError;
      if (customError.message === "Progress value is required and must be a non-negative number") {
        return res.status(400).json({
          status: "error",
          message: customError.message,
        });
      }
      if (customError.message === "Activity not found") {
        return res.status(404).json({
          status: "error",
          message: customError.message,
        });
      }
      res.status(500).json({
        status: "error",
        message: "Failed to update progress",
      });
    }
  },

  // Delete progress entry
  deleteProgress: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({
          status: "error",
          message: "User not authenticated",
        });
      }
      const { activityName } = req.params as { activityName: string };
      const { progressIndex } = req.body as { progressIndex: number };

      if (typeof progressIndex !== "number") {
        return res.status(400).json({
          status: "error",
          message: "Progress index is required",
        });
      }

      const updatedActivity = await deleteProgress(
        req.user._id.toString(),
        activityName,
        progressIndex,
      );

      res.json({
        status: "success",
        updatedActivity,
      });
    } catch (error) {
      const customError = error as CustomError;
      if (customError.message === "Progress entry not found") {
        return res.status(404).json({
          status: "error",
          message: customError.message,
        });
      }
      if (customError.message === "Activity not found") {
        return res.status(404).json({
          status: "error",
          message: customError.message,
        });
      }
      res.status(500).json({
        status: "error",
        message: "Failed to delete progress entry",
      });
    }
  },
};

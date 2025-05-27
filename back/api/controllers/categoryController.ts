import { Request, Response } from "express";
import { getCategories } from "../useCases/category/getCategories";
import { addCategory } from "../useCases/category/addCategory";
import { deleteCategory } from "../useCases/category/deleteCategory";
import { updateProgress } from "../useCases/category/updateProgress";
import { IUser } from "../models/User";

interface CustomError extends Error {
  message: string;
}

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const categoryController = {
  // Get all categories for the authenticated user
  getCategories: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({
          status: "error",
          message: "User not authenticated",
        });
      }
      const categories = await getCategories(req.user._id.toString());
      res.json({
        status: "success",
        categories,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to get categories",
      });
    }
  },

  // Add a new category
  addCategory: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({
          status: "error",
          message: "User not authenticated",
        });
      }
      const { name } = req.body as { name: string };
      const newCategory = await addCategory(req.user._id.toString(), name);

      res.status(201).json({
        status: "success",
        newCategory,
      });
    } catch (error) {
      const customError = error as CustomError;
      if (customError.message === "Category name is required") {
        return res.status(400).json({
          status: "error",
          message: customError.message,
        });
      }
      if (customError.message === "A category with this name already exists") {
        return res.status(409).json({
          status: "error",
          message: customError.message,
        });
      }
      res.status(500).json({
        status: "error",
        message: "Failed to add category",
      });
    }
  },

  // Delete a category
  deleteCategory: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({
          status: "error",
          message: "User not authenticated",
        });
      }
      const { categoryId } = req.params as { categoryId: string };
      await deleteCategory(req.user._id.toString(), categoryId);

      res.json({
        status: "success",
        message: "Category deleted successfully",
      });
    } catch (error) {
      const customError = error as CustomError;
      if (customError.message === "Category not found") {
        return res.status(404).json({
          status: "error",
          message: customError.message,
        });
      }
      res.status(500).json({
        status: "error",
        message: "Failed to delete category",
      });
    }
  },

  // Update category progress
  updateProgress: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({
          status: "error",
          message: "User not authenticated",
        });
      }
      const { categoryId } = req.params as { categoryId: string };
      const { value, notes } = req.body as { value: number; notes?: string };

      const updatedCategory = await updateProgress(
        req.user._id.toString(),
        categoryId,
        value,
        notes,
      );

      res.json({
        status: "success",
        updatedCategory,
      });
    } catch (error) {
      const customError = error as CustomError;
      if (customError.message === "Progress value is required and must be a non-negative number") {
        return res.status(400).json({
          status: "error",
          message: customError.message,
        });
      }
      if (customError.message === "Category not found") {
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
};

import { Request, Response } from "express";
import { User, Category, ProgressEntry } from "../models/User";

export const categoryController = {
  // Get all categories for the authenticated user
  getCategories: async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.user?._id);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      res.json({
        status: "success",
        data: user.categories,
      });
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to get categories",
      });
    }
  },

  // Add a new category
  addCategory: async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          status: "error",
          message: "Category name is required",
        });
      }

      const user = await User.findById(req.user?._id);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Check if category name already exists
      if (user.categories.some((cat) => cat.name === name)) {
        return res.status(409).json({
          status: "error",
          message: "A category with this name already exists",
        });
      }

      const newCategory: Category = {
        name: name.trim(),
        progress: [],
      };

      user.categories.push(newCategory);
      await user.save();

      res.status(201).json({
        status: "success",
        data: newCategory,
      });
    } catch (error) {
      console.error("Error adding category:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to add category",
      });
    }
  },

  // Delete a category
  deleteCategory: async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;
      const user = await User.findById(req.user?._id);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      const categoryIndex = user.categories.findIndex(
        (cat) => cat.name === categoryId
      );

      if (categoryIndex === -1) {
        return res.status(404).json({
          status: "error",
          message: "Category not found",
        });
      }

      user.categories.splice(categoryIndex, 1);
      await user.save();

      res.json({
        status: "success",
        message: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to delete category",
      });
    }
  },

  // Update category progress
  updateProgress: async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;
      const { value, notes } = req.body;

      if (typeof value !== "number" || value < 0) {
        return res.status(400).json({
          status: "error",
          message:
            "Progress value is required and must be a non-negative number",
        });
      }

      const user = await User.findById(req.user?._id);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      const category = user.categories.find((cat) => cat.name === categoryId);

      if (!category) {
        return res.status(404).json({
          status: "error",
          message: "Category not found",
        });
      }

      const newProgress: ProgressEntry = {
        value,
        date: new Date(),
        notes,
      };

      category.progress.push(newProgress);
      await user.save();

      res.json({
        status: "success",
        data: category,
      });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update progress",
      });
    }
  },
};

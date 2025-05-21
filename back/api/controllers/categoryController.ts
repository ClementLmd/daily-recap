import { Request, Response } from "express";
import { addCategory } from "../useCases/category/addCategory";
import { deleteCategory } from "../useCases/category/deleteCategory";
import { addProgress } from "../useCases/category/addProgress";
import { getCategories } from "../useCases/category/getCategories";

export const addCategoryController = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Category name is required",
      });
    }

    const category = await addCategory({ name });

    res.status(201).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "A category with this name already exists") {
        return res.status(409).json({
          status: "error",
          message: error.message,
        });
      }
    }

    res.status(500).json({
      status: "error",
      message: "Failed to create category",
    });
  }
};

export const deleteCategoryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Category ID is required",
      });
    }

    await deleteCategory({ id });

    res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Category not found") {
        return res.status(404).json({
          status: "error",
          message: error.message,
        });
      }
    }

    res.status(500).json({
      status: "error",
      message: "Failed to delete category",
    });
  }
};

export const addProgressController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { value, notes } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Category ID is required",
      });
    }

    if (typeof value !== "number" || value < 0) {
      return res.status(400).json({
        status: "error",
        message: "Valid progress value is required",
      });
    }

    const category = await addProgress({
      categoryId: id,
      value,
      notes,
    });

    res.status(200).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Category not found") {
        return res.status(404).json({
          status: "error",
          message: error.message,
        });
      }
    }

    res.status(500).json({
      status: "error",
      message: "Failed to add progress",
    });
  }
};

export const getCategoriesController = async (req: Request, res: Response) => {
  try {
    const categories = await getCategories();

    res.status(200).json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch categories",
    });
  }
};

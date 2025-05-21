import { Router } from "express";
import {
  addCategoryController,
  deleteCategoryController,
  addProgressController,
  getCategoriesController,
} from "../controllers/categoryController";

const router = Router();

// Get all categories
router.get("/", getCategoriesController);

// Add a new category
router.post("/", addCategoryController);

// Delete a category
router.delete("/:id", deleteCategoryController);

// Add progress to a category
router.post("/:id/progress", addProgressController);

export default router;

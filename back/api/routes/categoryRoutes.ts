import { Router } from "express";
import {
  addCategoryController,
  deleteCategoryController,
  addProgressController,
} from "../controllers/categoryController";

const router = Router();

// Add a new category
router.post("/", addCategoryController);

// Delete a category
router.delete("/:id", deleteCategoryController);

// Add progress to a category
router.post("/:id/progress", addProgressController);

export default router;

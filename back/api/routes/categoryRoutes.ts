import { Router } from "express";
import { categoryController } from "../controllers/categoryController";
import { requireAuth, csrfProtection } from "../middleware/auth";

const router = Router();

// Get all categories
router.get("/", requireAuth, categoryController.getCategories);

// Add a new category
router.post("/", requireAuth, csrfProtection, categoryController.addCategory);

// Delete a category
router.delete("/:categoryId", requireAuth, csrfProtection, categoryController.deleteCategory);

// Update category progress
router.post(
  "/:categoryId/progress",
  requireAuth,
  csrfProtection,
  categoryController.updateProgress,
);

export default router;

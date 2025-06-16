import { Router } from "express";
import { activityController } from "../controllers/activityController";
import { requireAuth, csrfProtection } from "../middleware/auth";

const router = Router();

// Get all activities
router.get("/", requireAuth, activityController.getActivities);

// Add a new activity
router.post("/", requireAuth, csrfProtection, activityController.addActivity);

// Delete a activity
router.delete("/:activityId", requireAuth, csrfProtection, activityController.deleteActivity);

// Update activity progress
router.post(
  "/:activityId/progress",
  requireAuth,
  csrfProtection,
  activityController.updateProgress,
);

// Delete progress entry
router.delete(
  "/:activityName/progress",
  requireAuth,
  csrfProtection,
  activityController.deleteProgress,
);

export default router;

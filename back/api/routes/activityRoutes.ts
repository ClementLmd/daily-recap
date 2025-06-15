import { Router } from "express";
import { requireAuth, csrfProtection } from "../middleware/auth";
import { activityController } from "../controllers/activityController";

const router = Router();

// Get all activities
router.get("/", requireAuth, activityController.getActivities);

// Add a new activity
router.post("/", requireAuth, csrfProtection, activityController.addActivity);

// Delete an activity
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
  "/:activityId/progress",
  requireAuth,
  csrfProtection,
  activityController.deleteProgress,
);

export default router;

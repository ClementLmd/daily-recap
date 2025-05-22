import { Router } from "express";
import {
  login,
  logout,
  checkSession,
  revokeAllSessions,
} from "../controllers/authController";
import {
  loginLimiter,
  requireAuth,
  csrfProtection,
  trackDevice,
} from "../middleware/auth";

const router = Router();

// Public routes
router.post("/login", loginLimiter, trackDevice, login);
router.post("/logout", requireAuth, csrfProtection, logout);
router.get("/check", requireAuth, checkSession);

// Protected routes
router.post("/revoke-all", requireAuth, csrfProtection, revokeAllSessions);

export default router;

import { Request, Response, NextFunction } from "express";
import { Session } from "../models/Session";
import { User } from "../models/User";
import rateLimit from "express-rate-limit";
import { createHash } from "crypto";

// Rate limiting middleware
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Session validation middleware
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionToken = req.cookies.session;

    if (!sessionToken) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // Find and validate session
    const session = await Session.findOne({
      token: sessionToken,
      isValid: true,
    });

    if (!session || session.isExpired()) {
      return res.status(401).json({
        status: "error",
        message: "Invalid or expired session",
      });
    }

    // Update last activity
    session.lastActivityAt = new Date();
    await session.save();

    // Check if session needs to be extended
    const daysUntilExpiration =
      (session.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilExpiration < 15) {
      session.extendExpiration();
      await session.save();
    }

    // Attach user and session to request
    const user = await User.findById(session.userId);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found",
      });
    }

    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// CSRF protection middleware
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const csrfToken = req.headers["x-csrf-token"];
  const sessionToken = req.cookies.session;

  if (!csrfToken || !sessionToken) {
    return res.status(403).json({
      status: "error",
      message: "CSRF token missing",
    });
  }

  // Generate expected CSRF token from session token
  const expectedToken = createHash("sha256")
    .update(sessionToken + process.env.CSRF_SECRET)
    .digest("hex");

  if (csrfToken !== expectedToken) {
    return res.status(403).json({
      status: "error",
      message: "Invalid CSRF token",
    });
  }

  next();
};

// Device tracking middleware
export const trackDevice = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deviceId = req.headers["x-device-id"] || req.cookies.deviceId;
  const userAgent = req.headers["user-agent"] || "unknown";
  const ipAddress = req.ip || "unknown";

  if (!deviceId) {
    // Generate new device ID if not present
    const newDeviceId = createHash("sha256")
      .update(userAgent + ipAddress + Date.now().toString())
      .digest("hex");
    res.cookie("deviceId", newDeviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });
  }

  req.deviceInfo = {
    deviceId: deviceId as string,
    userAgent: userAgent as string,
    ipAddress,
  };

  next();
};

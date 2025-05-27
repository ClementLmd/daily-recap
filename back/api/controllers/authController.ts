import { Request, Response } from "express";
import { User } from "../models/User";
import { Session } from "../models/Session";
import { createHash } from "crypto";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create new user
    const user = new User({
      email,
      password, // The password will be hashed by the User model's pre-save hook
    });

    await user.save();

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockoutTime = 15 * 60 * 1000; // 15 minutes
      const timeSinceLastAttempt = Date.now() - user.lastFailedLoginAt.getTime();

      if (timeSinceLastAttempt < lockoutTime) {
        return res.status(401).json({
          message: "Account is locked. Please try again later",
          remainingTime: Math.ceil((lockoutTime - timeSinceLastAttempt) / 1000 / 60),
        });
      }

      // Reset lock if lockout period has passed
      user.isLocked = false;
      user.failedLoginAttempts = 0;
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      user.failedLoginAttempts += 1;
      user.lastFailedLoginAt = new Date();

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
      }

      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();

    // Invalidate existing sessions
    await Session.updateMany({ userId: user._id, isValid: true }, { isValid: false });

    // Create new session
    const session = new Session({
      userId: user._id,
      token: Session.generateToken(),
      deviceInfo: req.deviceInfo,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    await session.save();

    // Generate CSRF token
    const csrfToken = createHash("sha256")
      .update(session.token + process.env.CSRF_SECRET)
      .digest("hex");

    // Set session cookie
    res.cookie("session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      csrfToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    if (req.session) {
      req.session.isValid = false;
      await req.session.save();
    }

    res.clearCookie("session");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkSession = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.session) {
      return res.status(401).json({ message: "No active session" });
    }

    // Generate new CSRF token
    const csrfToken = createHash("sha256")
      .update(req.session.token + process.env.CSRF_SECRET)
      .digest("hex");

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
      },
      csrfToken,
    });
  } catch (error) {
    console.error("Session check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const revokeAllSessions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    await Session.updateMany({ userId: req.user._id, isValid: true }, { isValid: false });

    res.clearCookie("session");
    res.json({ message: "All sessions revoked successfully" });
  } catch (error) {
    console.error("Revoke sessions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

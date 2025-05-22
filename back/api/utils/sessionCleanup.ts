import { Session } from "../models/Session";
import mongoose from "mongoose";

export const cleanupExpiredSessions = async () => {
  try {
    const result = await Session.deleteMany({
      $or: [{ expiresAt: { $lt: new Date() } }, { isValid: false }],
    });

    console.log(`Cleaned up ${result.deletedCount} expired sessions`);
  } catch (error) {
    console.error("Session cleanup error:", error);
  }
};

// Run cleanup every 24 hours
export const startSessionCleanupJob = () => {
  setInterval(cleanupExpiredSessions, 24 * 60 * 60 * 1000);

  // Run initial cleanup
  cleanupExpiredSessions();
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Running final session cleanup before shutdown...");
  await cleanupExpiredSessions();
  await mongoose.connection.close();
  process.exit(0);
});

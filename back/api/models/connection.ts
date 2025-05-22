import mongoose from "mongoose";

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    const connectionString =
      process.env.MONGODB_URI || "mongodb://localhost:27017/daily-recap";
    await mongoose.connect(connectionString);
    isConnected = true;
    console.log("Database connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export const disconnectFromDatabase = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("Database disconnected successfully");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
    throw error;
  }
};

process.on("SIGTERM", async () => {
  console.log("Closing database connection...");
  await mongoose.disconnect();
  process.exit(0);
});

connectToDatabase();

import mongoose from "mongoose";

let isConnected = false;

const getConnectionString = () => {
  if (process.env.NODE_ENV === "test") {
    return process.env.TEST_MONGODB_URI || "mongodb://localhost:27017/daily-recap-test";
  }
  return process.env.MONGODB_URI || "mongodb://localhost:27017/daily-recap";
};

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    const connectionString = getConnectionString();
    await mongoose.connect(connectionString);
    isConnected = true;
    console.log(
      `Database connected successfully to ${process.env.NODE_ENV || "development"} environment`,
    );
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

// Only set up SIGTERM handler in non-test environments
if (process.env.NODE_ENV !== "test") {
  process.on("SIGTERM", async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
}

// Only auto-connect in non-test environments
if (process.env.NODE_ENV !== "test") {
  connectToDatabase();
}

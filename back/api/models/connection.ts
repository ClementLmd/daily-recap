import mongoose from "mongoose";

let isConnected = false;

const getConnectionString = () => {
  console.log("Environment variables:", {
    NODE_ENV: process.env.NODE_ENV,
    TEST_MONGODB_URI: process.env.TEST_MONGODB_URI ? "set" : "not set",
    MONGODB_URI: process.env.MONGODB_URI ? "set" : "not set",
  });

  if (process.env.NODE_ENV === "test") {
    const uri = process.env.TEST_MONGODB_URI || "mongodb://localhost:27017/daily-recap-test";
    console.log("Using test connection string:", uri);
    return uri;
  }
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/daily-recap";
  console.log("Using connection string:", uri);
  return uri;
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
    console.log("Closing database connection...");
    await mongoose.disconnect();
    process.exit(0);
  });
}

// Only auto-connect in non-test environments
if (process.env.NODE_ENV !== "test") {
  connectToDatabase();
}

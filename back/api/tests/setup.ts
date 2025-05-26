import "dotenv/config";
import { config } from "dotenv";
import path from "path";
import mongoose from "mongoose";
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "../models/connection";

// Load test environment variables
config({ path: path.resolve(__dirname, "../.env.test") });

// Set test database URI
process.env.MONGODB_URI =
  process.env.TEST_MONGODB_URI || "mongodb://localhost:27017/daily-recap-test";

beforeAll(async () => {
  await connectToDatabase();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await disconnectFromDatabase();
});

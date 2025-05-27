import "dotenv/config";
import { config } from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { connectToDatabase, disconnectFromDatabase } from "../models/connection";

// Load test environment variables
config({ path: path.resolve(__dirname, "../.env.test") });

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

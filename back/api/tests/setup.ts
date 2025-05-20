import "dotenv/config";
import { config } from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { connectToDatabase } from "../models/connection";

// Load test environment variables
config({ path: path.resolve(__dirname, "../.env.test") });

const TEST_DB_URI = process.env.TEST_DB_URI;

if (!TEST_DB_URI) {
  throw new Error("TEST_DB_URI environment variable is not set");
}

beforeAll(async () => {
  await connectToDatabase();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

import mongoose from "mongoose";

let databaseEnvironment: "test" | "production" | "development";

const defineConnectionString = () => {
  const testSuffix = process.env.JEST_WORKER_ID
    ? `_${process.env.JEST_WORKER_ID}`
    : "";

  if (process.env.NODE_ENV === "test") {
    databaseEnvironment = "test";
    return `${process.env.CONNECTION_STRING_TEST}${testSuffix}`;
  }

  if (process.env.NODE_ENV === "development") {
    databaseEnvironment = "development";
    return process.env.CONNECTION_STRING_DEV;
  }

  databaseEnvironment = "production";
  return process.env.CONNECTION_STRING;
};

const connectionString = defineConnectionString();

if (!connectionString) {
  throw new Error(
    "MongoDB connection string is undefined. Check your environment variables."
  );
}

export const connectToDatabase = () => {
  mongoose
    .connect(connectionString, { connectTimeoutMS: 2000 })
    .then(() => {
      if (process.env.NODE_ENV !== "production") {
        console.log(`Database connected - ${databaseEnvironment}`);
      }
    })
    .catch((error) => console.error(error));
};

process.on("SIGTERM", async () => {
  console.log("Closing database connection...");
  await mongoose.disconnect();
  process.exit(0);
});

connectToDatabase();

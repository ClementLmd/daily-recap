import dotenv from "dotenv";
dotenv.config();

import "./models/connection";
import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import categoryRoutes from "./routes/categoryRoutes";
import authRoutes from "./routes/auth";
import mongoose from "mongoose";
import { startSessionCleanupJob } from "./utils/sessionCleanup";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-cookie"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});
// app.use("/users", usersRoute);

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/auth", authRoutes);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

// Connect to MongoDB
//explain
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/daily-recap")
  .then(() => {
    console.log("Connected to MongoDB");
    // Start session cleanup job
    startSessionCleanupJob();
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

export default app;

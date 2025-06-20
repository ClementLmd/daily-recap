import request from "supertest";
import app from "../app";
import { User, IUser } from "../models/User";
import mongoose from "mongoose";
import { Session } from "../models/Session";
import { createHash } from "crypto";

describe("Activity Integration Tests", () => {
  let testUser: IUser & { _id: mongoose.Types.ObjectId };
  let sessionToken: string;
  let csrfToken: string;

  beforeEach(async () => {
    // Create a test user
    testUser = (await User.create({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    })) as IUser & { _id: mongoose.Types.ObjectId };

    // Create a session for the test user
    const session = await Session.create({
      userId: testUser._id,
      token: Session.generateToken(),
      deviceInfo: {
        userAgent: "test-agent",
        ipAddress: "127.0.0.1",
        deviceId: "test-device",
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    sessionToken = session.token;
    csrfToken = createHash("sha256")
      .update(sessionToken + process.env.CSRF_SECRET)
      .digest("hex");
  });

  describe("POST /api/activities", () => {
    it("should create a new activity", async () => {
      const activityData = {
        name: "Test Activity",
      };

      const response = await request(app)
        .post("/api/activities")
        .send(activityData)
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.newActivity.name).toBe(activityData.name);
    });

    it("should return 401 if not authenticated", async () => {
      const activityData = {
        name: "Test Activity",
      };

      const response = await request(app).post("/api/activities").send(activityData).expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Authentication required");
    });

    it("should return 400 if name is missing", async () => {
      const response = await request(app)
        .post("/api/activities")
        .send({})
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Activity name is required");
    });

    it("should return 409 if activity name already exists", async () => {
      // First create a activity
      const activityData = {
        name: "Duplicate Activity",
      };

      await request(app)
        .post("/api/activities")
        .send(activityData)
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(201);

      // Try to create the same activity again
      const response = await request(app)
        .post("/api/activities")
        .send(activityData)
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(409);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("A activity with this name already exists");
    });

    it("should trim whitespace from activity name", async () => {
      const activityData = {
        name: "  Trimmed Activity  ",
      };

      const response = await request(app)
        .post("/api/activities")
        .send(activityData)
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(201);

      expect(response.body.newActivity.name).toBe("Trimmed Activity");
    });
  });

  describe("DELETE /api/activities/:activityId", () => {
    it("should delete an existing activity", async () => {
      // Create a test activity
      const activityName = "Test Activity";
      const createResponse = await request(app)
        .post("/api/activities")
        .send({ name: activityName })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(201);

      const activityId = createResponse.body.newActivity._id;

      // Delete the activity
      const response = await request(app)
        .delete(`/api/activities/${activityId}`)
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Activity deleted successfully");

      // Verify the activity is deleted
      const user = await User.findById(testUser._id);
      expect(user?.activities.find((cat) => cat._id.toString() === activityId)).toBeUndefined();
    });

    it("should return 404 if activity is not found", async () => {
      const response = await request(app)
        .delete("/api/activities/507f1f77bcf86cd799439011") // A non-existent MongoDB ID
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(404);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Activity not found");
    });
  });

  describe("POST /api/activities/:activityId/progress", () => {
    const activityName = "Test Activity";

    beforeEach(async () => {
      // Create a test activity
      await request(app)
        .post("/api/activities")
        .send({ name: activityName })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(201);
    });

    it("should add progress to a activity", async () => {
      const progressData = {
        value: 30,
        notes: "Read chapter 5",
      };

      const response = await request(app)
        .post(`/api/activities/${activityName}/progress`)
        .send(progressData)
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.updatedActivity.name).toBe(activityName);
      expect(response.body.updatedActivity.progress).toHaveLength(1);
      expect(response.body.updatedActivity.progress[0].value).toBe(progressData.value);
      expect(response.body.updatedActivity.progress[0].notes).toBe(progressData.notes);
      expect(response.body.updatedActivity.progress[0].date).toBeDefined();
    });

    it("should return 400 if value is missing", async () => {
      const response = await request(app)
        .post(`/api/activities/${activityName}/progress`)
        .send({ notes: "Some notes" })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe(
        "Progress value is required and must be a non-negative number",
      );
    });

    it("should return 404 if activity is not found", async () => {
      const response = await request(app)
        .post("/api/activities/nonexistent/progress")
        .send({ value: 30 })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(404);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Activity not found");
    });
  });

  describe("GET /api/activities", () => {
    it("should return all activities for the user", async () => {
      // Create multiple activities
      const activities = ["Activity 1", "Activity 2", "Activity 3"];
      for (const name of activities) {
        await request(app)
          .post("/api/activities")
          .send({ name })
          .set("Cookie", [`session=${sessionToken}`])
          .set("x-csrf-token", csrfToken)
          .expect(201);
      }

      // Add some progress to one activity
      await request(app)
        .post("/api/activities/Activity 1/progress")
        .send({ value: 10 })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);

      const response = await request(app)
        .get("/api/activities")
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.activities).toHaveLength(3);

      // Verify activity with progress
      const activityWithProgress = response.body.activities.find(
        (cat: { name: string; progress: Array<{ value: number }> }) => cat.name === "Activity 1",
      );
      expect(activityWithProgress.progress[0].value).toBe(10);
      expect(activityWithProgress.progress).toHaveLength(1);

      // Verify activities without progress
      const activitiesWithoutProgress = response.body.activities.filter(
        (cat: { name: string; progress: Array<{ value: number }> }) => cat.name !== "Activity 1",
      );
      activitiesWithoutProgress.forEach(
        (cat: { name: string; progress: Array<{ value: number }> }) => {
          expect(cat.progress).toHaveLength(0);
        },
      );
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/api/activities").expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Authentication required");
    });
  });

  describe("DELETE /api/activities/:activityName/progress", () => {
    const activityName = "Test Activity";

    beforeEach(async () => {
      // Create a test activity
      await request(app)
        .post("/api/activities")
        .send({ name: activityName })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(201);

      // Add some progress entries
      await request(app)
        .post(`/api/activities/${activityName}/progress`)
        .send({ value: 10, notes: "First entry" })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);

      await request(app)
        .post(`/api/activities/${activityName}/progress`)
        .send({ value: 20, notes: "Second entry" })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);
    });

    it("should delete a progress entry", async () => {
      // First verify the initial state
      const initialResponse = await request(app)
        .get("/api/activities")
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);

      const initialActivity = initialResponse.body.activities.find(
        (cat: { name: string }) => cat.name === activityName,
      );
      expect(initialActivity.progress).toHaveLength(2);

      // Find the entry with value 20 (the one we want to delete)
      const entryToDelete = initialActivity.progress.find(
        (entry: { value: number }) => entry.value === 20,
      );
      expect(entryToDelete).toBeDefined();

      // Delete the entry with value 20
      const response = await request(app)
        .delete(`/api/activities/${activityName}/progress`)
        .send({ progressIndex: 0 })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.updatedActivity.name).toBe(activityName);
      expect(response.body.updatedActivity.progress).toHaveLength(1);

      // Verify the remaining entry is the one with value 10
      const remainingEntry = response.body.updatedActivity.progress[0];
      expect(remainingEntry.value).toBe(10);
      expect(remainingEntry.notes).toBe("First entry");
      expect(response.body.updatedActivity.count).toBe(10); // Total count should be updated
    });

    it("should return 404 if activity is not found", async () => {
      const response = await request(app)
        .delete("/api/activities/nonexistent/progress")
        .send({ progressIndex: 0 })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(404);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Activity not found");
    });

    it("should return 404 if progress entry is not found", async () => {
      const response = await request(app)
        .delete(`/api/activities/${activityName}/progress`)
        .send({ progressIndex: 5 }) // Non-existent index
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(404);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Progress entry not found");
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app)
        .delete(`/api/activities/${activityName}/progress`)
        .send({ progressIndex: 0 })
        .expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Authentication required");
    });

    it("should return 400 if progressIndex is missing", async () => {
      const response = await request(app)
        .delete(`/api/activities/${activityName}/progress`)
        .send({})
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Progress index is required");
    });
  });
});

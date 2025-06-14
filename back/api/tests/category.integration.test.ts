import request from "supertest";
import app from "../app";
import { User, IUser } from "../models/User";
import mongoose from "mongoose";
import { Session } from "../models/Session";
import { createHash } from "crypto";

describe("Category Integration Tests", () => {
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

  describe("POST /api/categories", () => {
    it("should create a new category", async () => {
      const categoryData = {
        name: "Test Category",
      };

      const response = await request(app)
        .post("/api/categories")
        .send(categoryData)
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.newCategory.name).toBe(categoryData.name);
    });

    it("should return 401 if not authenticated", async () => {
      const categoryData = {
        name: "Test Category",
      };

      const response = await request(app).post("/api/categories").send(categoryData).expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Authentication required");
    });

    it("should return 400 if name is missing", async () => {
      const response = await request(app)
        .post("/api/categories")
        .send({})
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Category name is required");
    });

    it("should return 409 if category name already exists", async () => {
      // First create a category
      const categoryData = {
        name: "Duplicate Category",
      };

      await request(app)
        .post("/api/categories")
        .send(categoryData)
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(201);

      // Try to create the same category again
      const response = await request(app)
        .post("/api/categories")
        .send(categoryData)
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(409);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("A category with this name already exists");
    });

    it("should trim whitespace from category name", async () => {
      const categoryData = {
        name: "  Trimmed Category  ",
      };

      const response = await request(app)
        .post("/api/categories")
        .send(categoryData)
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(201);

      expect(response.body.newCategory.name).toBe("Trimmed Category");
    });
  });

  describe("DELETE /api/categories/:categoryId", () => {
    it("should delete an existing category", async () => {
      // Create a test category
      const categoryName = "Test Category";
      const createResponse = await request(app)
        .post("/api/categories")
        .send({ name: categoryName })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(201);

      const categoryId = createResponse.body.newCategory._id;

      // Delete the category
      const response = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Category deleted successfully");

      // Verify the category is deleted
      const user = await User.findById(testUser._id);
      expect(user?.categories.find((cat) => cat._id.toString() === categoryId)).toBeUndefined();
    });

    it("should return 404 if category is not found", async () => {
      const response = await request(app)
        .delete("/api/categories/507f1f77bcf86cd799439011") // A non-existent MongoDB ID
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(404);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Category not found");
    });
  });

  describe("POST /api/categories/:categoryId/progress", () => {
    const categoryName = "Test Category";

    beforeEach(async () => {
      // Create a test category
      await request(app)
        .post("/api/categories")
        .send({ name: categoryName })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(201);
    });

    it("should add progress to a category", async () => {
      const progressData = {
        value: 30,
        notes: "Read chapter 5",
      };

      const response = await request(app)
        .post(`/api/categories/${categoryName}/progress`)
        .send(progressData)
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.updatedCategory.name).toBe(categoryName);
      expect(response.body.updatedCategory.progress).toHaveLength(1);
      expect(response.body.updatedCategory.progress[0].value).toBe(progressData.value);
      expect(response.body.updatedCategory.progress[0].notes).toBe(progressData.notes);
      expect(response.body.updatedCategory.progress[0].date).toBeDefined();
    });

    it("should return 400 if value is missing", async () => {
      const response = await request(app)
        .post(`/api/categories/${categoryName}/progress`)
        .send({ notes: "Some notes" })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe(
        "Progress value is required and must be a non-negative number",
      );
    });

    it("should return 404 if category is not found", async () => {
      const response = await request(app)
        .post("/api/categories/nonexistent/progress")
        .send({ value: 30 })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(404);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Category not found");
    });
  });

  describe("GET /api/categories", () => {
    it("should return all categories for the user", async () => {
      // Create multiple categories
      const categories = ["Category 1", "Category 2", "Category 3"];
      for (const name of categories) {
        await request(app)
          .post("/api/categories")
          .send({ name })
          .set("Cookie", [`session=${sessionToken}`])
          .set("x-csrf-token", csrfToken)
          .expect(201);
      }

      // Add some progress to one category
      await request(app)
        .post("/api/categories/Category 1/progress")
        .send({ value: 10 })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);

      const response = await request(app)
        .get("/api/categories")
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.categories).toHaveLength(3);

      // Verify category with progress
      const categoryWithProgress = response.body.categories.find(
        (cat: { name: string; progress: Array<{ value: number }> }) => cat.name === "Category 1",
      );
      expect(categoryWithProgress.progress[0].value).toBe(10);
      expect(categoryWithProgress.progress).toHaveLength(1);

      // Verify categories without progress
      const categoriesWithoutProgress = response.body.categories.filter(
        (cat: { name: string; progress: Array<{ value: number }> }) => cat.name !== "Category 1",
      );
      categoriesWithoutProgress.forEach(
        (cat: { name: string; progress: Array<{ value: number }> }) => {
          expect(cat.progress).toHaveLength(0);
        },
      );
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/api/categories").expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Authentication required");
    });
  });

  describe("DELETE /api/categories/:categoryName/progress", () => {
    const categoryName = "Test Category";

    beforeEach(async () => {
      // Create a test category
      await request(app)
        .post("/api/categories")
        .send({ name: categoryName })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(201);

      // Add some progress entries
      await request(app)
        .post(`/api/categories/${categoryName}/progress`)
        .send({ value: 10, notes: "First entry" })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);

      await request(app)
        .post(`/api/categories/${categoryName}/progress`)
        .send({ value: 20, notes: "Second entry" })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);
    });

    it("should delete a progress entry", async () => {
      // First verify the initial state
      const initialResponse = await request(app)
        .get("/api/categories")
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);

      const initialCategory = initialResponse.body.categories.find(
        (cat: { name: string }) => cat.name === categoryName,
      );
      expect(initialCategory.progress).toHaveLength(2);

      // Find the entry with value 20 (the one we want to delete)
      const entryToDelete = initialCategory.progress.find(
        (entry: { value: number }) => entry.value === 20,
      );
      expect(entryToDelete).toBeDefined();

      // Delete the entry with value 20
      const response = await request(app)
        .delete(`/api/categories/${categoryName}/progress`)
        .send({ progressIndex: 0 })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.updatedCategory.name).toBe(categoryName);
      expect(response.body.updatedCategory.progress).toHaveLength(1);

      // Verify the remaining entry is the one with value 10
      const remainingEntry = response.body.updatedCategory.progress[0];
      expect(remainingEntry.value).toBe(10);
      expect(remainingEntry.notes).toBe("First entry");
      expect(response.body.updatedCategory.count).toBe(10); // Total count should be updated
    });

    it("should return 404 if category is not found", async () => {
      const response = await request(app)
        .delete("/api/categories/nonexistent/progress")
        .send({ progressIndex: 0 })
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(404);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Category not found");
    });

    it("should return 404 if progress entry is not found", async () => {
      const response = await request(app)
        .delete(`/api/categories/${categoryName}/progress`)
        .send({ progressIndex: 5 }) // Non-existent index
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(404);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Progress entry not found");
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app)
        .delete(`/api/categories/${categoryName}/progress`)
        .send({ progressIndex: 0 })
        .expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Authentication required");
    });

    it("should return 400 if progressIndex is missing", async () => {
      const response = await request(app)
        .delete(`/api/categories/${categoryName}/progress`)
        .send({})
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Progress index is required");
    });
  });
});

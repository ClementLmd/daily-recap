import request from "supertest";
import app from "../app";
import { Category } from "../models/Category";
import mongoose from "mongoose";

describe("Progress Integration Tests", () => {
  let category: mongoose.Document & { _id: mongoose.Types.ObjectId };

  beforeEach(async () => {
    category = (await Category.create({
      name: "Test Category - Pages read",
    })) as mongoose.Document & { _id: mongoose.Types.ObjectId };
  });

  describe("POST /api/categories/:id/progress", () => {
    it("should add progress to a category", async () => {
      const progressData = {
        value: 30,
        notes: "Read chapter 5",
      };

      const response = await request(app)
        .post(`/api/categories/${category._id}/progress`)
        .send(progressData)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.progress).toHaveLength(1);
      expect(response.body.data.progress[0].value).toBe(progressData.value);
      expect(response.body.data.progress[0].notes).toBe(progressData.notes);
      expect(response.body.data.progress[0].date).toBeDefined();
    });

    it("should return 400 if value is missing", async () => {
      const response = await request(app)
        .post(`/api/categories/${category._id}/progress`)
        .send({ notes: "Some notes" })
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Valid progress value is required");
    });

    it("should return 400 if value is negative", async () => {
      const response = await request(app)
        .post(`/api/categories/${category._id}/progress`)
        .send({ value: -10 })
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Valid progress value is required");
    });

    it("should return 404 if category is not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .post(`/api/categories/${nonExistentId}/progress`)
        .send({ value: 30 })
        .expect(404);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Category not found");
    });

    it("should add multiple progress entries to a category", async () => {
      // Add first progress entry
      await request(app)
        .post(`/api/categories/${category._id}/progress`)
        .send({ value: 30, notes: "First entry" })
        .expect(200);

      // Add second progress entry
      const response = await request(app)
        .post(`/api/categories/${category._id}/progress`)
        .send({ value: 45, notes: "Second entry" })
        .expect(200);

      expect(response.body.data.progress).toHaveLength(2);
      expect(response.body.data.progress[1].value).toBe(45);
      expect(response.body.data.progress[1].notes).toBe("Second entry");
    });
  });
});

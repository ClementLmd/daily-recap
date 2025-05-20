import request from "supertest";
import app from "../app";
import { Category, CategoryDocument } from "../models/Category";
import { deleteCategory } from "../useCases/category/deleteCategory";
import mongoose from "mongoose";

describe("Category Integration Tests", () => {
  describe("POST /api/categories", () => {
    it("should create a new category", async () => {
      const categoryData = {
        name: "Test Category",
      };

      const response = await request(app)
        .post("/api/categories")
        .send(categoryData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.name).toBe(categoryData.name);
      expect(response.body.data._id).toBeDefined();
    });

    it("should return 400 if name is missing", async () => {
      const response = await request(app)
        .post("/api/categories")
        .send({})
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Category name is required");
    });

    it("should return 409 if category name already exists", async () => {
      // First create a category
      const categoryData = {
        name: "Duplicate Category",
      };

      await Category.create(categoryData);

      // Try to create the same category again
      const response = await request(app)
        .post("/api/categories")
        .send(categoryData)
        .expect(409);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe(
        "A category with this name already exists"
      );
    });

    it("should trim whitespace from category name", async () => {
      const categoryData = {
        name: "  Trimmed Category  ",
      };

      const response = await request(app)
        .post("/api/categories")
        .send(categoryData)
        .expect(201);

      expect(response.body.data.name).toBe("Trimmed Category");
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("should delete an existing category", async () => {
      // Create a test category
      const category = (await Category.create({
        name: "Test Category",
      })) as mongoose.Document & { _id: mongoose.Types.ObjectId };

      // Delete the category
      await deleteCategory({ id: category._id.toString() });

      // Verify the category is deleted
      const deletedCategory = await Category.findById(category._id);
      expect(deletedCategory).toBeNull();
    });

    it("should throw an error when category is not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      await expect(deleteCategory({ id: nonExistentId })).rejects.toThrow(
        "Category not found"
      );
    });
  });
});

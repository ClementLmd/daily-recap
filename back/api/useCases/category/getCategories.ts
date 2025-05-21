import { Category } from "../../models/Category";

export const getCategories = async () => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return categories;
  } catch (error) {
    throw new Error("Failed to fetch categories");
  }
};

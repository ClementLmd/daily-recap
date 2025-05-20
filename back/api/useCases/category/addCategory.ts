import { Category, CategoryInterface } from "../../models/Category";

interface AddCategoryInput {
  name: string;
}

export const addCategory = async (
  input: AddCategoryInput
): Promise<CategoryInterface> => {
  try {
    const category = await Category.create({
      name: input.name,
    });

    return category;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("duplicate key error")) {
        throw new Error("A category with this name already exists");
      }
    }
    throw error;
  }
};

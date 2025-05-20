import { Category, CategoryDocument } from "../../models/Category";

interface AddProgressInput {
  categoryId: string;
  value: number;
  notes?: string;
}

export const addProgress = async (
  input: AddProgressInput
): Promise<CategoryDocument> => {
  try {
    const category = await Category.findById(input.categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    const updatedCategory = await category.addProgress(
      input.value,
      input.notes
    );
    return updatedCategory;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to add progress");
  }
};

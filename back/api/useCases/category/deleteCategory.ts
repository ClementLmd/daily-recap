import { Category } from "../../models/Category";

interface DeleteCategoryInput {
  id: string;
}

export const deleteCategory = async (
  input: DeleteCategoryInput
): Promise<void> => {
  try {
    const category = await Category.findById(input.id);

    if (!category) {
      throw new Error("Category not found");
    }

    await Category.findByIdAndDelete(input.id);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete category");
  }
};

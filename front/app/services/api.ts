const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface ProgressEntry {
  value: number;
  date: string;
  notes?: string;
}

export interface CategoryResponse {
  _id: string;
  name: string;
  count: number;
  progress: ProgressEntry[];
}

export const api = {
  // Get all categories
  getCategories: async (): Promise<ApiResponse<CategoryResponse[]>> => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
  },

  // Add a new category
  addCategory: async (name: string): Promise<ApiResponse<CategoryResponse>> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error("Failed to add category");
    return response.json();
  },

  // Add progress to a category
  addProgress: async (
    categoryId: string,
    value: number,
    notes: string | undefined
  ): Promise<ApiResponse<CategoryResponse>> => {
    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/progress`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value, notes }),
      }
    );
    if (!response.ok) throw new Error("Failed to add progress");
    return response.json();
  },

  // Delete a category
  deleteCategory: async (categoryId: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete category");
    return response.json();
  },
};

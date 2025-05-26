import { Category } from "../store/types";

interface ApiResponse<T> {
  apiResponseData: T;
  status: number;
  message?: string;
}

interface BackendResponse<T> {
  status: string;
  data?: T;
  categories?: Category[];
  newCategory?: Category;
  updatedCategory?: Category;
}

class Api {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    csrfToken?: string | null
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return {
      apiResponseData: data,
      status: response.status,
    };
  }

  async getCategories(
    csrfToken?: string | null
  ): Promise<ApiResponse<BackendResponse<Category[]>>> {
    return this.request<BackendResponse<Category[]>>(
      "/categories",
      {
        method: "GET",
      },
      csrfToken
    );
  }

  async addCategory(
    name: string,
    csrfToken?: string | null
  ): Promise<ApiResponse<BackendResponse<Category>>> {
    return this.request<BackendResponse<Category>>(
      "/categories",
      {
        method: "POST",
        body: JSON.stringify({ name }),
      },
      csrfToken
    );
  }

  async saveProgress(
    payload: { categoryId: string; count: number; notes?: string },
    csrfToken?: string | null
  ): Promise<ApiResponse<BackendResponse<Category>>> {
    // Get the category name from the store
    const category = (
      await this.getCategories(csrfToken)
    ).apiResponseData.categories?.find((cat) => cat._id === payload.categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    return this.request<BackendResponse<Category>>(
      `/categories/${encodeURIComponent(category.name)}/progress`,
      {
        method: "POST",
        body: JSON.stringify({
          value: payload.count,
          notes: payload.notes,
        }),
      },
      csrfToken
    );
  }

  async deleteCategory(
    categoryId: string,
    csrfToken?: string | null
  ): Promise<ApiResponse<BackendResponse<void>>> {
    return this.request<BackendResponse<void>>(
      `/categories/${categoryId}`,
      {
        method: "DELETE",
      },
      csrfToken
    );
  }
}

export const api = new Api();

import { Activity } from "../store/types";

interface ApiResponse<T> {
  apiResponseData: T;
  status: number;
  message?: string;
}

interface BackendResponse<T> {
  status: string;
  data?: T;
  activities?: Activity[];
  newActivity?: Activity;
  updatedActivity?: Activity;
}

class Api {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    csrfToken?: string | null,
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

  async getActivities(
    csrfToken?: string | null,
  ): Promise<ApiResponse<BackendResponse<Activity[]>>> {
    return this.request<BackendResponse<Activity[]>>(
      "/activities",
      {
        method: "GET",
      },
      csrfToken,
    );
  }

  async addActivity(
    name: string,
    csrfToken?: string | null,
  ): Promise<ApiResponse<BackendResponse<Activity>>> {
    return this.request<BackendResponse<Activity>>(
      "/activities",
      {
        method: "POST",
        body: JSON.stringify({ name }),
      },
      csrfToken,
    );
  }

  async saveProgress(
    payload: { activityId: string; count: number; notes?: string },
    csrfToken?: string | null,
  ): Promise<ApiResponse<BackendResponse<Activity>>> {
    // Get the activity name from the store
    const activity = (await this.getActivities(csrfToken)).apiResponseData.activities?.find(
      (cat) => cat._id === payload.activityId,
    );

    if (!activity) {
      throw new Error("Activity not found");
    }

    return this.request<BackendResponse<Activity>>(
      `/activities/${encodeURIComponent(activity.name)}/progress`,
      {
        method: "POST",
        body: JSON.stringify({
          value: payload.count,
          notes: payload.notes,
        }),
      },
      csrfToken,
    );
  }

  async deleteActivity(
    activityId: string,
    csrfToken?: string | null,
  ): Promise<ApiResponse<BackendResponse<void>>> {
    return this.request<BackendResponse<void>>(
      `/activities/${activityId}`,
      {
        method: "DELETE",
      },
      csrfToken,
    );
  }

  async deleteProgress(
    activityName: string,
    progressIndex: number,
    csrfToken?: string | null,
  ): Promise<ApiResponse<BackendResponse<Activity>>> {
    return this.request<BackendResponse<Activity>>(
      `/activities/${encodeURIComponent(activityName)}/progress`,
      {
        method: "DELETE",
        body: JSON.stringify({ progressIndex }),
      },
      csrfToken,
    );
  }
}

export const api = new Api();

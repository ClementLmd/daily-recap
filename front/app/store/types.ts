export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ProgressEntry {
  value: number;
  date: string;
  notes?: string;
}

export interface Activity {
  _id: string;
  name: string;
  count: number;
  tempCount: number; // Temporary count before saving
  progress: ProgressEntry[];
}

export interface ActivitiesState {
  activities: Activity[];
  loading: boolean;
  error: string | null;
}

export interface SaveProgressPayload {
  activityId: string;
  count: number;
  notes?: string;
}

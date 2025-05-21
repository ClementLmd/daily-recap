export interface Category {
  _id: string;
  name: string;
  count: number;
  tempCount: number; // Temporary count before saving
  progress: ProgressEntry[];
}

export interface ProgressEntry {
  value: number;
  date: string;
  notes?: string;
}

export interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export interface SaveProgressPayload {
  categoryId: string;
  count: number;
  notes?: string;
}

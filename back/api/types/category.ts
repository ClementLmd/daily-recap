import { Types } from "mongoose";

export interface AddCategoryInput {
  name: string;
  userId: Types.ObjectId;
}

export interface DeleteCategoryInput {
  id: string;
  userId: Types.ObjectId;
}

export interface AddProgressInput {
  categoryId: string;
  userId: Types.ObjectId;
  value: number;
  notes?: string;
}

export interface GetCategoriesInput {
  userId: Types.ObjectId;
}

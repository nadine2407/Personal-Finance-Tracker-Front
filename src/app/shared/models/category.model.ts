export interface Category {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface CategoryRequest {
  name: string;
  icon: string | null;
  color: string | null;
}
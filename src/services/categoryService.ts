import type { Category } from "./productService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getCategories(token: string): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Failed to load categories.");
  }
  return response.json();
}

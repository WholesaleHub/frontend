import type { Category } from "./productService";
import { extractErrorMessage } from "../utils/apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getCategories(token: string): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to load categories."));
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function createCategory(
  token: string,
  category: { category_name: string; description?: string }
): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(category),
  });
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to create category."));
  }
  return response.json();
}
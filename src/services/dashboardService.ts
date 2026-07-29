import { extractErrorMessage } from "../utils/apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type DashboardStats = {
  totalProducts: number;
  totalCategories: number;
  lowStockProducts: number;
};

export async function getDashboardStats(token: string): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to load dashboard statistics."));
  }
  return response.json();
}
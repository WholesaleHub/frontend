import { extractErrorMessage } from "../utils/apiError";
import type { Order } from "./orderService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type DashboardStats = {
  totalProducts: number;
  totalCategories: number;
  lowStockProducts: number;
};

export type CustomerDashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  packedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentOrders: Order[];
};

export async function getDashboardStats(
  token: string,
): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
        "Failed to load dashboard statistics.",
      ),
    );
  }

  return response.json();
}

export async function getCustomerDashboard(
  token: string,
): Promise<CustomerDashboardStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/customer`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "Failed to load your dashboard."),
    );
  }

  return response.json();
}

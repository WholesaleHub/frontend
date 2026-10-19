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

export type AdminDashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  totalCategories: number;
  lowStockProducts: number;
  revenueSummary: string | number;
};

export type SalesAnalyticsPoint = {
  date: string;
  revenue: string | number;
  orders: number;
};

export type OrderStatusAnalytics = {
  status: string;
  count: number;
};

export type SalesAnalytics = {
  totalRevenue: string | number;
  totalOrders: number;
  ordersByStatus: OrderStatusAnalytics[];
  salesOverTime: SalesAnalyticsPoint[];
};

export type AdminLowStockProduct = {
  productId: number;
  productName: string;
  sku: string;
  unitPrice: string | number;
  stockQuantity: number;
  category: {
    category_id: number;
    category_name: string;
  } | null;
  stockStatus: "LOW_STOCK" | "OUT_OF_STOCK";
};

export type SalesAnalyticsQuery = {
  startDate?: string;
  endDate?: string;
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

export async function getAdminDashboardStats(
  token: string,
): Promise<AdminDashboardStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
        "Failed to load administrator dashboard statistics.",
      ),
    );
  }

  return response.json();
}

export async function getSalesAnalytics(
  token: string,
  query: SalesAnalyticsQuery = {},
): Promise<SalesAnalytics> {
  const parameters = new URLSearchParams();

  if (query.startDate) {
    parameters.set("startDate", query.startDate);
  }

  if (query.endDate) {
    parameters.set("endDate", query.endDate);
  }

  const queryString = parameters.toString();

  const response = await fetch(
    `${API_BASE_URL}/dashboard/sales${queryString ? `?${queryString}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "Failed to load sales analytics."),
    );
  }

  return response.json();
}

export async function getAdminLowStockProducts(
  token: string,
): Promise<AdminLowStockProduct[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/low-stock`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "Failed to load low-stock products."),
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

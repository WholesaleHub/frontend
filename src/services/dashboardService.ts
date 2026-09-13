import { extractErrorMessage } from "../utils/apiError";
import type { Order } from "./orderService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleDashboardResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, fallbackMessage));
  }

  return response.json();
}

function createDateQuery(range: AnalyticsDateRange): string {
  const params = new URLSearchParams();

  if (range.startDate) {
    params.set("startDate", range.startDate);
  }

  if (range.endDate) {
    params.set("endDate", range.endDate);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function authorizationHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

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

export type AnalyticsDateRange = {
  startDate?: string;
  endDate?: string;
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

export type OrdersByStatus = {
  status: string;
  count: number;
};

export type SalesOverTime = {
  date: string;
  revenue: string | number;
  orders: number;
};

export type SalesAnalytics = {
  totalRevenue: string | number;
  totalOrders: number;
  ordersByStatus: OrdersByStatus[];
  salesOverTime: SalesOverTime[];
};

export type TopProduct = {
  productId: number;
  productName?: string;
  sku?: string;
  unitPrice?: string | number;
  stockQuantity?: number;
  quantitySold: number;
  revenue: string | number;
  orderCount: number;
};

export type ProductCategorySummary = {
  category_id: number;
  category_name: string;
};

export type LowStockProduct = {
  productId: number;
  productName: string;
  sku: string;
  unitPrice: string | number;
  stockQuantity: number;
  category?: ProductCategorySummary;
  stockStatus: "LOW_STOCK" | "OUT_OF_STOCK";
};

export type CustomerAnalyticsItem = {
  customerId: number;
  businessName: string;
  businessLocation: string;
  contactPerson: string;
  status: string;
  createdAt: string;
};

export type RecentCustomer = {
  customer_id: number;
  business_name: string;
  contact_person: string;
  status: string;
  created_at: string;
};

export type CustomerAnalytics = {
  totalCustomers: number;
  newCustomers: number;
  newCustomersOverTime: CustomerAnalyticsItem[];
  recentCustomers: RecentCustomer[];
};

export type AdminRecentOrderItem = {
  quantity: number;
  subtotal: string | number;
  product: {
    product_id: number;
    product_name: string;
    sku: string;
  };
};

export type AdminRecentOrder = {
  orderId: number;
  orderDate: string;
  status: string;
  totalAmount: string | number;
  customer: {
    customer_id: number;
    business_name: string;
    contact_person: string;
  };
  itemCount: number;
  items: AdminRecentOrderItem[];
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

export async function getAdminDashboardStats(
  token: string,
): Promise<AdminDashboardStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/admin/stats`, {
    headers: authorizationHeaders(token),
  });

  return handleDashboardResponse<AdminDashboardStats>(
    response,
    "Failed to load admin dashboard statistics.",
  );
}

export async function getSalesAnalytics(
  token: string,
  range: AnalyticsDateRange = {},
): Promise<SalesAnalytics> {
  const response = await fetch(
    `${API_BASE_URL}/dashboard/sales${createDateQuery(range)}`,
    {
      headers: authorizationHeaders(token),
    },
  );

  return handleDashboardResponse<SalesAnalytics>(
    response,
    "Failed to load sales analytics.",
  );
}

export async function getTopProducts(token: string): Promise<TopProduct[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/top-products`, {
    headers: authorizationHeaders(token),
  });

  return handleDashboardResponse<TopProduct[]>(
    response,
    "Failed to load top-selling products.",
  );
}

export async function getLowStockProducts(
  token: string,
): Promise<LowStockProduct[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/low-stock`, {
    headers: authorizationHeaders(token),
  });

  return handleDashboardResponse<LowStockProduct[]>(
    response,
    "Failed to load low-stock products.",
  );
}

export async function getCustomerAnalytics(
  token: string,
  range: AnalyticsDateRange = {},
): Promise<CustomerAnalytics> {
  const response = await fetch(
    `${API_BASE_URL}/dashboard/customers${createDateQuery(range)}`,
    {
      headers: authorizationHeaders(token),
    },
  );

  return handleDashboardResponse<CustomerAnalytics>(
    response,
    "Failed to load customer analytics.",
  );
}

export async function getAdminRecentOrders(
  token: string,
): Promise<AdminRecentOrder[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/recent-orders`, {
    headers: authorizationHeaders(token),
  });

  return handleDashboardResponse<AdminRecentOrder[]>(
    response,
    "Failed to load recent orders.",
  );
}

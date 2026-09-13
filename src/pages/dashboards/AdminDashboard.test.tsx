import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminDashboard from "./AdminDashboard";
import {
  getAdminDashboardStats,
  getAdminRecentOrders,
  getCustomerAnalytics,
  getLowStockProducts,
  getSalesAnalytics,
  getTopProducts,
} from "../../services/dashboardService";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    token: "admin-token",
    user: {
      id: "admin-1",
      fullName: "Admin User",
      email: "admin@example.com",
      role: "ADMIN",
    },
  }),
}));

vi.mock("../../layouts/DashboardLayout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("../../services/dashboardService", () => ({
  getAdminDashboardStats: vi.fn(),
  getSalesAnalytics: vi.fn(),
  getTopProducts: vi.fn(),
  getLowStockProducts: vi.fn(),
  getCustomerAnalytics: vi.fn(),
  getAdminRecentOrders: vi.fn(),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-chart">{children}</div>
  ),
  LineChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="sales-chart">{children}</div>
  ),
  PieChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="status-chart">{children}</div>
  ),
  Pie: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Line: () => null,
  Cell: () => null,
  Legend: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

const mockStats = {
  totalOrders: 20,
  pendingOrders: 4,
  deliveredOrders: 11,
  totalProducts: 35,
  totalCategories: 6,
  lowStockProducts: 3,
  revenueSummary: "50000",
};

const mockSales = {
  totalRevenue: "25000",
  totalOrders: 8,
  ordersByStatus: [
    { status: "PENDING", count: 3 },
    { status: "DELIVERED", count: 5 },
  ],
  salesOverTime: [
    {
      date: "2026-09-01T10:00:00.000Z",
      revenue: "10000",
      orders: 3,
    },
    {
      date: "2026-09-02T10:00:00.000Z",
      revenue: "15000",
      orders: 5,
    },
  ],
};

const mockCustomers = {
  totalCustomers: 12,
  newCustomers: 2,
  newCustomersOverTime: [],
  recentCustomers: [],
};

const mockTopProducts = [
  {
    productId: 1,
    productName: "Maize Flour",
    sku: "MF-001",
    unitPrice: "200",
    stockQuantity: 60,
    quantitySold: 40,
    revenue: "8000",
    orderCount: 6,
  },
];

const mockLowStockProducts = [
  {
    productId: 2,
    productName: "Cooking Oil",
    sku: "CO-001",
    unitPrice: "350",
    stockQuantity: 4,
    category: {
      category_id: 3,
      category_name: "Cooking Essentials",
    },
    stockStatus: "LOW_STOCK" as const,
  },
];

const mockRecentOrders = [
  {
    orderId: 91,
    orderDate: "2026-09-10T09:00:00.000Z",
    status: "PENDING",
    totalAmount: "3200",
    customer: {
      customer_id: 7,
      business_name: "Nafuna Retail",
      contact_person: "Grace Nafuna",
    },
    itemCount: 5,
    items: [],
  },
];

function configureSuccessfulResponses() {
  vi.mocked(getAdminDashboardStats).mockResolvedValue(mockStats);
  vi.mocked(getSalesAnalytics).mockResolvedValue(mockSales);
  vi.mocked(getCustomerAnalytics).mockResolvedValue(mockCustomers);
  vi.mocked(getTopProducts).mockResolvedValue(mockTopProducts);
  vi.mocked(getLowStockProducts).mockResolvedValue(mockLowStockProducts);
  vi.mocked(getAdminRecentOrders).mockResolvedValue(mockRecentOrders);
}

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureSuccessfulResponses();
  });

  it("loads and displays the complete reporting dashboard", async () => {
    render(<AdminDashboard />);

    expect(
      screen.getByRole("status", {
        name: "Loading dashboard data",
      }),
    ).toBeInTheDocument();

    expect(await screen.findByText("Maize Flour")).toBeInTheDocument();

    expect(screen.getByText("Cooking Oil")).toBeInTheDocument();
    expect(screen.getByText("Nafuna Retail")).toBeInTheDocument();
    expect(screen.getByText("#91")).toBeInTheDocument();
    expect(screen.getByText(/25,000/)).toBeInTheDocument();
    expect(screen.getByTestId("sales-chart")).toBeInTheDocument();
    expect(screen.getByTestId("status-chart")).toBeInTheDocument();

    expect(getAdminDashboardStats).toHaveBeenCalledWith("admin-token");
    expect(getSalesAnalytics).toHaveBeenCalledWith("admin-token", {});
    expect(getCustomerAnalytics).toHaveBeenCalledWith("admin-token", {});
    expect(getTopProducts).toHaveBeenCalledWith("admin-token");
    expect(getLowStockProducts).toHaveBeenCalledWith("admin-token");
    expect(getAdminRecentOrders).toHaveBeenCalledWith("admin-token");
  });

  it("applies the selected date range to supported analytics", async () => {
    render(<AdminDashboard />);

    await screen.findByText("Maize Flour");

    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-09-01" },
    });

    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-09-10" },
    });

    await userEvent.click(screen.getByRole("button", { name: "Apply range" }));

    await waitFor(() => {
      expect(getSalesAnalytics).toHaveBeenLastCalledWith("admin-token", {
        startDate: "2026-09-01",
        endDate: "2026-09-10",
      });
    });

    expect(getCustomerAnalytics).toHaveBeenLastCalledWith("admin-token", {
      startDate: "2026-09-01",
      endDate: "2026-09-10",
    });
  });

  it("rejects an invalid date range without making another request", async () => {
    render(<AdminDashboard />);

    await screen.findByText("Maize Flour");

    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-09-10" },
    });

    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-09-01" },
    });

    await userEvent.click(screen.getByRole("button", { name: "Apply range" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The start date cannot be later than the end date.",
    );

    expect(getSalesAnalytics).toHaveBeenCalledTimes(1);
    expect(getCustomerAnalytics).toHaveBeenCalledTimes(1);
  });

  it("displays empty states when reporting collections have no data", async () => {
    vi.mocked(getSalesAnalytics).mockResolvedValue({
      totalRevenue: 0,
      totalOrders: 0,
      ordersByStatus: [],
      salesOverTime: [],
    });

    vi.mocked(getTopProducts).mockResolvedValue([]);
    vi.mocked(getLowStockProducts).mockResolvedValue([]);
    vi.mocked(getAdminRecentOrders).mockResolvedValue([]);

    render(<AdminDashboard />);

    expect(
      await screen.findByText("No sales were recorded for this period."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("No order-status data is available for this period."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("No product sales are available yet."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("No active products are currently low in stock."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("No orders have been placed yet."),
    ).toBeInTheDocument();
  });

  it("displays an API error and allows the administrator to retry", async () => {
    vi.mocked(getAdminDashboardStats)
      .mockRejectedValueOnce(new Error("Reporting service unavailable."))
      .mockResolvedValue(mockStats);

    render(<AdminDashboard />);

    expect(
      await screen.findByText("Reporting service unavailable."),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Try Again" }));

    expect(await screen.findByText("Maize Flour")).toBeInTheDocument();
    expect(getAdminDashboardStats).toHaveBeenCalledTimes(2);
  });
});

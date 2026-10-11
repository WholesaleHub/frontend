import {
  AlertTriangle,
  BadgePercent,
  Banknote,
  Building2,
  ClipboardList,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { adminNavItems } from "../../config/adminNav";
import { useAuth } from "../../context/AuthContext";
import {
  getAdminDashboardStats,
  getAdminLowStockProducts,
  getSalesAnalytics,
  type AdminDashboardStats,
  type AdminLowStockProduct,
  type SalesAnalytics,
  type SalesAnalyticsPoint,
} from "../../services/dashboardService";
import { getCustomers } from "../../services/customerService";
import {
  getOrders,
  type Order,
  type OrderStatus,
} from "../../services/orderService";
import ErrorState from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";

type RevenuePeriod = "7" | "30" | "90" | "365";

type RevenueChartPoint = {
  date: string;
  revenue: number;
  orders: number;
};

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-KE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-KE", {
  day: "2-digit",
  month: "short",
});

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PACKED: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatCurrency(value: string | number): string {
  const amount = Number(value);

  return Number.isFinite(amount) ? currencyFormatter.format(amount) : "—";
}

function formatDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function getSalesDateRange(period: RevenuePeriod) {
  const endDate = new Date();
  const startDate = new Date();

  startDate.setDate(endDate.getDate() - (Number(period) - 1));

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}

function aggregateSalesByDay(
  points: SalesAnalyticsPoint[],
): RevenueChartPoint[] {
  const grouped = new Map<string, RevenueChartPoint>();

  points.forEach((point) => {
    const date = point.date.slice(0, 10);
    const existing = grouped.get(date);
    const revenue = Number(point.revenue);

    if (existing) {
      existing.revenue += Number.isFinite(revenue) ? revenue : 0;
      existing.orders += point.orders;
      return;
    }

    grouped.set(date, {
      date,
      revenue: Number.isFinite(revenue) ? revenue : 0,
      orders: point.orders,
    });
  });

  return [...grouped.values()].sort((first, second) =>
    first.date.localeCompare(second.date),
  );
}

export default function AdminDashboard() {
  const { token } = useAuth();

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [customerCount, setCustomerCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<
    AdminLowStockProduct[]
  >([]);
  const [period, setPeriod] = useState<RevenuePeriod>("30");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!token) {
      setError("Your session is unavailable. Please log in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const dateRange = getSalesDateRange(period);

      const [
        statsData,
        analyticsData,
        customersData,
        ordersData,
        lowStockData,
      ] = await Promise.all([
        getAdminDashboardStats(token),
        getSalesAnalytics(token, dateRange),
        getCustomers(token, { page: 1, limit: 1 }),
        getOrders(token, { sort: "desc" }),
        getAdminLowStockProducts(token),
      ]);

      setStats(statsData);
      setAnalytics(analyticsData);
      setCustomerCount(customersData.pagination.total);
      setRecentOrders(ordersData.slice(0, 15));
      setLowStockProducts(lowStockData.slice(0, 8));
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load the administrator dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [period, token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const chartData = useMemo(
    () => aggregateSalesByDay(analytics?.salesOverTime ?? []),
    [analytics],
  );

  return (
    <DashboardLayout navItems={adminNavItems}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#003049]">Admin Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor sales, orders, customers and inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="hidden text-xs text-gray-400 sm:inline">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#003049] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && !isLoading && (
        <ErrorState message={error} onRetry={() => void loadDashboard()} />
      )}

      {!error && (
        <>
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading || !stats ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-lg bg-white p-5 shadow">
                  <Skeleton className="mb-4 h-5 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ))
            ) : (
              <>
                <StatCard
                  label="Total Sales"
                  value={formatCurrency(stats.revenueSummary)}
                  icon={<Banknote size={21} className="text-green-600" />}
                />

                <StatCard
                  label="Total Orders"
                  value={stats.totalOrders.toLocaleString()}
                  icon={<ShoppingBag size={21} className="text-blue-600" />}
                />

                <StatCard
                  label="Total Customers"
                  value={customerCount.toLocaleString()}
                  icon={<Building2 size={21} className="text-purple-600" />}
                />

                <StatCard
                  label="Total Products"
                  value={stats.totalProducts.toLocaleString()}
                  icon={<Package size={21} className="text-[#f77f00]" />}
                />
              </>
            )}
          </section>

          <section className="mb-6 rounded-lg bg-white p-5 shadow">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-[#003049]">
                  Revenue Overview
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Sales performance for the selected period.
                </p>
              </div>

              <div
                className="flex w-fit rounded-lg bg-gray-100 p-1"
                aria-label="Revenue period"
              >
                {(
                  [
                    ["7", "7D"],
                    ["30", "30D"],
                    ["90", "3M"],
                    ["365", "1Y"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPeriod(value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                      period === value
                        ? "bg-white text-[#003049] shadow-sm"
                        : "text-gray-500 hover:text-[#003049]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : chartData.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed text-sm text-gray-500">
                No sales were recorded during this period.
              </div>
            ) : (
              <RevenueChart data={chartData} />
            )}
          </section>

          <section className="mb-6">
            <h2 className="mb-3 font-semibold text-[#003049]">Quick Actions</h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <QuickAction
                to="/dashboard/admin/products/new"
                label="Add Product"
                description="Create a new inventory item"
                icon={<Plus size={20} />}
              />

              <QuickAction
                to="/dashboard/admin/orders"
                label="Review Orders"
                description="Manage orders and statuses"
                icon={<ClipboardList size={20} />}
              />

              <button
                type="button"
                disabled
                title="Promotion management is coming soon"
                className="flex items-start gap-3 rounded-lg bg-white p-4 text-left shadow opacity-60"
              >
                <span className="rounded-lg bg-orange-100 p-2 text-[#f77f00]">
                  <BadgePercent size={20} />
                </span>

                <span>
                  <span className="block text-sm font-semibold text-[#003049]">
                    Create Promotion
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    Coming soon
                  </span>
                </span>
              </button>

              <QuickAction
                to="/dashboard/admin/customers"
                label="Customer Actions"
                description="Review and manage customers"
                icon={<Building2 size={20} />}
              />
            </div>
          </section>

          <RecentOrdersSection orders={recentOrders} isLoading={isLoading} />

          <LowStockSection
            products={lowStockProducts}
            isLoading={isLoading}
            totalLowStock={stats?.lowStockProducts ?? 0}
          />
        </>
      )}
    </DashboardLayout>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-white p-5 shadow">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        {icon}
      </div>

      <p className="text-2xl font-bold text-[#003049]">{value}</p>
    </div>
  );
}

function QuickAction({
  to,
  label,
  description,
  icon,
}: {
  to: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 rounded-lg bg-white p-4 shadow transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="rounded-lg bg-blue-50 p-2 text-[#003049]">{icon}</span>

      <span>
        <span className="block text-sm font-semibold text-[#003049]">
          {label}
        </span>
        <span className="mt-1 block text-xs text-gray-500">{description}</span>
      </span>
    </Link>
  );
}

function RevenueChart({ data }: { data: RevenueChartPoint[] }) {
  const maximumRevenue = Math.max(...data.map((point) => point.revenue), 1);
  const minimumWidth = Math.max(data.length * 44, 640);

  return (
    <div className="overflow-x-auto">
      <div
        className="flex h-64 items-end gap-2 border-b border-gray-200 px-2 pt-4"
        style={{ minWidth: `${minimumWidth}px` }}
        role="img"
        aria-label="Revenue bar chart"
      >
        {data.map((point) => {
          const height =
            point.revenue === 0
              ? 2
              : Math.max((point.revenue / maximumRevenue) * 100, 6);

          return (
            <div
              key={point.date}
              className="flex h-full min-w-8 flex-1 flex-col items-center justify-end"
            >
              <div
                title={`${formatDate(point.date)}: ${formatCurrency(
                  point.revenue,
                )} from ${point.orders} orders`}
                className="w-full max-w-10 rounded-t bg-[#f77f00] transition-colors hover:bg-[#d62828]"
                style={{ height: `${height}%` }}
              />

              <span className="mt-2 whitespace-nowrap text-[10px] text-gray-500">
                {shortDateFormatter.format(new Date(point.date))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentOrdersSection({
  orders,
  isLoading,
}: {
  orders: Order[];
  isLoading: boolean;
}) {
  return (
    <section className="mb-6 overflow-hidden rounded-lg bg-white shadow">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="font-semibold text-[#003049]">Recent Orders</h2>
          <p className="mt-1 text-sm text-gray-500">
            The 15 most recently placed orders.
          </p>
        </div>

        <Link
          to="/dashboard/admin/orders"
          className="text-sm font-medium text-[#f77f00] hover:underline"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-gray-500">
          No orders have been placed yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#003049]">
                    #{order.order_id}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {order.customer?.business_name ??
                      `Customer #${order.customer_id}`}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(order.order_date)}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {order.orderItems.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(order.total_amount)}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusColors[order.status]
                      }`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/dashboard/admin/orders/${order.order_id}`}
                      className="font-medium text-[#f77f00] hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function LowStockSection({
  products,
  isLoading,
  totalLowStock,
}: {
  products: AdminLowStockProduct[];
  isLoading: boolean;
  totalLowStock: number;
}) {
  return (
    <section className="overflow-hidden rounded-lg bg-white shadow">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-start gap-2">
          <AlertTriangle size={19} className="mt-0.5 text-[#d62828]" />

          <div>
            <h2 className="font-semibold text-[#003049]">
              Low-Stock Inventory
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {totalLowStock} products currently need attention.
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/admin/products"
          className="text-sm font-medium text-[#f77f00] hover:underline"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-gray-500">
          All active products have healthy stock levels.
        </p>
      ) : (
        <div className="divide-y">
          {products.map((product) => (
            <div
              key={product.productId}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  to={`/products/${product.productId}`}
                  className="font-medium text-[#003049] hover:underline"
                >
                  {product.productName}
                </Link>

                <p className="mt-1 text-xs text-gray-500">
                  SKU: {product.sku} ·{" "}
                  {product.category?.category_name ?? "Uncategorized"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    product.stockStatus === "OUT_OF_STOCK"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {product.stockQuantity === 0
                    ? "Out of stock"
                    : `${product.stockQuantity} remaining`}
                </span>

                <Link
                  to={`/dashboard/admin/products/${product.productId}/edit`}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-[#003049] hover:bg-gray-50"
                >
                  Edit stock
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

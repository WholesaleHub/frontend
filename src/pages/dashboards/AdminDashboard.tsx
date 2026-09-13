import {
  AlertTriangle,
  Banknote,
  Boxes,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShoppingCart,
  Users,
} from "lucide-react";
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { adminNavItems } from "../../config/adminNav";
import { useAuth } from "../../context/AuthContext";
import ErrorState from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  getAdminDashboardStats,
  getAdminRecentOrders,
  getCustomerAnalytics,
  getLowStockProducts,
  getSalesAnalytics,
  getTopProducts,
  type AdminDashboardStats,
  type AdminRecentOrder,
  type AnalyticsDateRange,
  type CustomerAnalytics,
  type LowStockProduct,
  type SalesAnalytics,
  type TopProduct,
} from "../../services/dashboardService";

type AdminDashboardData = {
  stats: AdminDashboardStats;
  sales: SalesAnalytics;
  customers: CustomerAnalytics;
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];
  recentOrders: AdminRecentOrder[];
};

type SummaryCardProps = {
  label: string;
  value: string | number;
  description: string;
  icon: ReactNode;
};

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-KE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const chartDateFormatter = new Intl.DateTimeFormat("en-KE", {
  day: "2-digit",
  month: "short",
});

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  PACKED: "#6366f1",
  SHIPPED: "#8b5cf6",
  DELIVERED: "#16a34a",
  CANCELLED: "#dc2626",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function formatCurrency(value: string | number): string {
  const amount = Number(value);
  return Number.isFinite(amount) ? currencyFormatter.format(amount) : "—";
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function SummaryCard({ label, value, description, icon }: SummaryCardProps) {
  return (
    <article className="rounded-xl bg-white p-5 shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[#003049]">{value}</p>
        </div>

        <div className="rounded-lg bg-orange-50 p-3 text-[#f77f00]">{icon}</div>
      </div>

      <p className="mt-3 text-xs text-gray-500">{description}</p>
    </article>
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Loading dashboard data"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-white p-5 shadow">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-8 w-36" />
            <Skeleton className="mt-3 h-3 w-44" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useAuth();

  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!token) {
      setError("Your session is unavailable. Please log in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [
        stats,
        sales,
        customers,
        topProducts,
        lowStockProducts,
        recentOrders,
      ] = await Promise.all([
        getAdminDashboardStats(token),
        getSalesAnalytics(token, dateRange),
        getCustomerAnalytics(token, dateRange),
        getTopProducts(token),
        getLowStockProducts(token),
        getAdminRecentOrders(token),
      ]);

      setData({
        stats,
        sales,
        customers,
        topProducts,
        lowStockProducts,
        recentOrders,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load the reporting dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const salesChartData = useMemo(
    () =>
      (data?.sales.salesOverTime ?? []).map((item) => {
        const date = new Date(item.date);

        return {
          date: Number.isNaN(date.getTime())
            ? item.date
            : chartDateFormatter.format(date),
          revenue: Number(item.revenue) || 0,
          orders: item.orders,
        };
      }),
    [data],
  );

  const statusChartData = useMemo(
    () =>
      (data?.sales.ordersByStatus ?? []).map((item) => ({
        name: STATUS_LABELS[item.status] ?? item.status,
        status: item.status,
        value: item.count,
      })),
    [data],
  );

  function applyDateRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDateError("");

    if (startDate && endDate && startDate > endDate) {
      setDateError("The start date cannot be later than the end date.");
      return;
    }

    setDateRange({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  }

  function clearDateRange() {
    setStartDate("");
    setEndDate("");
    setDateError("");
    setDateRange({});
  }

  const hasDateRange = Boolean(dateRange.startDate || dateRange.endDate);

  return (
    <DashboardLayout navItems={adminNavItems}>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#003049]">
            Reporting Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor sales, customers, orders and inventory performance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={isLoading}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-[#003049] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={isLoading ? "animate-spin" : undefined}
          />
          Refresh
        </button>
      </div>

      <section className="mb-6 rounded-xl bg-white p-4 shadow">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays size={18} className="text-[#f77f00]" />
          <h2 className="font-semibold text-[#003049]">Analytics date range</h2>
        </div>

        <form
          onSubmit={applyDateRange}
          noValidate
          className="flex flex-col gap-3 lg:flex-row lg:items-end"
        >
          <label className="flex flex-1 flex-col gap-1 text-sm text-gray-600">
            Start date
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => {
                setStartDate(event.target.value);
                setDateError("");
              }}
              className="rounded-lg border px-3 py-2 outline-none focus:border-[#f77f00] focus:ring-2 focus:ring-orange-100"
            />
          </label>

          <label className="flex flex-1 flex-col gap-1 text-sm text-gray-600">
            End date
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => {
                setEndDate(event.target.value);
                setDateError("");
              }}
              className="rounded-lg border px-3 py-2 outline-none focus:border-[#f77f00] focus:ring-2 focus:ring-orange-100"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-[#f77f00] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#d62828] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Apply range
          </button>

          <button
            type="button"
            onClick={clearDateRange}
            disabled={isLoading || (!startDate && !endDate && !hasDateRange)}
            className="rounded-lg border px-5 py-2 text-sm font-semibold text-[#003049] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </form>

        {dateError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {dateError}
          </p>
        )}

        <p className="mt-3 text-xs text-gray-500">
          The selected range filters revenue, orders and new-customer analytics.
          Inventory sections remain current.
        </p>
      </section>

      {error && !isLoading && (
        <ErrorState
          title="Dashboard unavailable"
          message={error}
          onRetry={() => void loadDashboard()}
        />
      )}

      {!error && isLoading && <DashboardSkeleton />}

      {!error && !isLoading && data && (
        <div className="space-y-6">
          <section
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Dashboard summary"
          >
            <SummaryCard
              label="Total revenue"
              value={formatCurrency(data.sales.totalRevenue)}
              description={
                hasDateRange
                  ? "Revenue within the selected period"
                  : "Revenue across all recorded orders"
              }
              icon={<Banknote size={22} />}
            />

            <SummaryCard
              label="Total orders"
              value={data.sales.totalOrders}
              description={
                hasDateRange
                  ? "Orders within the selected period"
                  : "All orders recorded"
              }
              icon={<ShoppingCart size={22} />}
            />

            <SummaryCard
              label="Total customers"
              value={data.customers.totalCustomers}
              description={`${data.customers.newCustomers} registered within the selected period`}
              icon={<Users size={22} />}
            />

            <SummaryCard
              label="Low-stock products"
              value={data.stats.lowStockProducts}
              description="Active products with 20 units or fewer"
              icon={<AlertTriangle size={22} />}
            />

            <SummaryCard
              label="Total products"
              value={data.stats.totalProducts}
              description={`${data.stats.totalCategories} product categories`}
              icon={<Boxes size={22} />}
            />

            <SummaryCard
              label="Delivered orders"
              value={data.stats.deliveredOrders}
              description={`${data.stats.pendingOrders} orders currently pending`}
              icon={<CheckCircle2 size={22} />}
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <article className="rounded-xl bg-white p-5 shadow">
              <div className="mb-5">
                <h2 className="font-semibold text-[#003049]">
                  Sales over time
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Revenue and order volume for the selected period.
                </p>
              </div>

              {salesChartData.length === 0 ? (
                <div className="flex h-72 items-center justify-center text-sm text-gray-500">
                  No sales were recorded for this period.
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesChartData}>
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis
                        fontSize={12}
                        tickFormatter={(value) =>
                          Number(value).toLocaleString("en-KE")
                        }
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue (KES)"
                        stroke="#f77f00"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </article>

            <article className="rounded-xl bg-white p-5 shadow">
              <div className="mb-5">
                <h2 className="font-semibold text-[#003049]">
                  Orders by status
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Distribution of orders for the selected period.
                </p>
              </div>

              {statusChartData.length === 0 ? (
                <div className="flex h-72 items-center justify-center text-sm text-gray-500">
                  No order-status data is available for this period.
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {statusChartData.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={STATUS_COLORS[entry.status] ?? "#94a3b8"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </article>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <article className="rounded-xl bg-white p-5 shadow">
              <Clock3 size={20} className="text-[#f77f00]" />
              <h2 className="mt-3 font-semibold text-[#003049]">
                New customers
              </h2>
              <p className="mt-2 text-3xl font-bold text-[#003049]">
                {data.customers.newCustomers}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Registered within the selected period
              </p>
            </article>

            <article className="rounded-xl bg-white p-5 shadow xl:col-span-2">
              <h2 className="font-semibold text-[#003049]">
                Reporting snapshot
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-gray-500">All-time revenue</dt>
                  <dd className="mt-1 font-semibold text-[#003049]">
                    {formatCurrency(data.stats.revenueSummary)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-gray-500">All-time orders</dt>
                  <dd className="mt-1 font-semibold text-[#003049]">
                    {data.stats.totalOrders}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-gray-500">Top products</dt>
                  <dd className="mt-1 font-semibold text-[#003049]">
                    {data.topProducts.length}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-gray-500">Recent orders</dt>
                  <dd className="mt-1 font-semibold text-[#003049]">
                    {data.recentOrders.length}
                  </dd>
                </div>
              </dl>
            </article>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <article className="rounded-xl bg-white p-5 shadow">
              <h2 className="font-semibold text-[#003049]">
                Top-selling products
              </h2>

              {data.topProducts.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">
                  No product sales are available yet.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="text-left text-gray-500">
                      <tr>
                        <th className="pb-3 font-medium">Product</th>
                        <th className="pb-3 font-medium">Sold</th>
                        <th className="pb-3 font-medium">Orders</th>
                        <th className="pb-3 text-right font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProducts.map((product) => (
                        <tr key={product.productId} className="border-t">
                          <td className="py-3">
                            <p className="font-medium text-[#003049]">
                              {product.productName ?? "Unknown product"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.sku ?? "No SKU"}
                            </p>
                          </td>
                          <td className="py-3">{product.quantitySold}</td>
                          <td className="py-3">{product.orderCount}</td>
                          <td className="py-3 text-right font-medium">
                            {formatCurrency(product.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="rounded-xl bg-white p-5 shadow">
              <h2 className="font-semibold text-[#003049]">
                Low-stock products
              </h2>

              {data.lowStockProducts.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">
                  No active products are currently low in stock.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="text-left text-gray-500">
                      <tr>
                        <th className="pb-3 font-medium">Product</th>
                        <th className="pb-3 font-medium">Category</th>
                        <th className="pb-3 text-right font-medium">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.lowStockProducts.map((product) => (
                        <tr key={product.productId} className="border-t">
                          <td className="py-3">
                            <p className="font-medium text-[#003049]">
                              {product.productName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.sku}
                            </p>
                          </td>
                          <td className="py-3 text-gray-600">
                            {product.category?.category_name ?? "Uncategorized"}
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                product.stockQuantity === 0
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {product.stockQuantity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          </section>

          <article className="overflow-hidden rounded-xl bg-white shadow">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold text-[#003049]">Recent orders</h2>
              <p className="mt-1 text-sm text-gray-500">
                The five most recently placed wholesale orders.
              </p>
            </div>

            {data.recentOrders.length === 0 ? (
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
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr key={order.orderId} className="border-t">
                        <td className="px-4 py-3 font-medium text-[#003049]">
                          #{order.orderId}
                        </td>
                        <td className="px-4 py-3">
                          {order.customer.business_name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="px-4 py-3">{order.itemCount}</td>
                        <td className="px-4 py-3">
                          <span
                            className="rounded-full px-2.5 py-1 text-xs font-medium text-white"
                            style={{
                              backgroundColor:
                                STATUS_COLORS[order.status] ?? "#64748b",
                            }}
                          >
                            {STATUS_LABELS[order.status] ?? order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(order.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </div>
      )}
    </DashboardLayout>
  );
}

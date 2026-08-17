import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  RefreshCw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";
import { useAuth } from "../../context/AuthContext";
import {
  getOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "../../services/orderService";
import { Skeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";

const statuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PACKED: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  minimumFractionDigits: 0,
});

function formatCurrency(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? currencyFormatter.format(amount) : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function WholesalerOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await getOrders(token, {
        customer: search,
        status,
        sort,
      });
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  }, [search, sort, status, token]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function handleStatusChange(orderId: number, nextStatus: OrderStatus) {
    if (!token) return;

    const previousOrders = orders;
    setUpdatingId(orderId);
    setError("");

    setOrders((current) =>
      current.map((order) =>
        order.order_id === orderId ? { ...order, status: nextStatus } : order,
      ),
    );

    try {
      await updateOrderStatus(token, orderId, nextStatus);
    } catch (err) {
      setOrders(previousOrders);
      setError(
        err instanceof Error ? err.message : "Failed to update order status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <DashboardLayout navItems={wholesalerNavItems}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#003049]">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review customer orders and manage fulfilment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadOrders()}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#003049] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <span className="sr-only">Search customers</span>
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by business name"
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 outline-none focus:border-[#f77f00] focus:ring-2 focus:ring-orange-100"
          />
        </label>

        <label className="relative">
          <span className="sr-only">Filter by status</span>
          <SlidersHorizontal
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as OrderStatus | "")
            }
            className="w-full appearance-none rounded-lg border border-gray-300 py-2 pl-9 pr-8 outline-none focus:border-[#f77f00] md:w-44"
          >
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as "asc" | "desc")}
          className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[#f77f00]"
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState message={error} onRetry={() => void loadOrders()} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl bg-white px-6 py-16 text-center shadow-sm">
          <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
          <h2 className="font-semibold text-[#003049]">No orders found</h2>
          <p className="mt-1 text-sm text-gray-500">
            Try changing the search term or status filter.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl bg-white shadow-sm md:block">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-semibold text-[#003049]">
                      #{order.order_id}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800">
                        {order.customer?.business_name ?? "Unknown customer"}
                      </p>
                      {order.customer?.contact_person && (
                        <p className="text-xs text-gray-500">
                          {order.customer.contact_person}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {order.orderItems.length}
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(order.order_date)}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={order.status}
                        disabled={updatingId === order.order_id}
                        onChange={(event) =>
                          void handleStatusChange(
                            order.order_id,
                            event.target.value as OrderStatus,
                          )
                        }
                        className={`rounded-full border-0 px-3 py-1 text-xs font-semibold outline-none ${statusStyles[order.status]}`}
                      >
                        {statuses.map((item) => (
                          <option key={item} value={item}>
                            {item.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        to={`/dashboard/wholesaler/orders/${order.order_id}`}
                        aria-label={`View order ${order.order_id}`}
                        className="inline-flex rounded-lg p-2 text-[#003049] hover:bg-blue-50"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {orders.map((order) => (
              <article
                key={order.order_id}
                className="rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#003049]">
                      Order #{order.order_id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customer?.business_name ?? "Unknown customer"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="my-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Total</p>
                    <p className="font-semibold">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Items</p>
                    <p className="font-semibold">{order.orderItems.length}</p>
                  </div>
                </div>

                <select
                  value={order.status}
                  disabled={updatingId === order.order_id}
                  onChange={(event) =>
                    void handleStatusChange(
                      order.order_id,
                      event.target.value as OrderStatus,
                    )
                  }
                  className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {item.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>

                <Link
                  to={`/dashboard/wholesaler/orders/${order.order_id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 text-sm font-medium text-[#003049]"
                >
                  <Eye size={16} />
                  View details
                </Link>
              </article>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

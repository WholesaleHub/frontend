import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { retailerNavItems } from "../../config/retailerNav";
import {
  orderStatusLabels,
  statusColors,
} from "../../config/orderStatusColors";
import { useAuth } from "../../context/AuthContext";
import { getMyOrders, type Order } from "../../services/orderService";
import ErrorState from "../../components/ui/ErrorState";
import { SkeletonTableRow } from "../../components/ui/Skeleton";

const STATUSES = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
});

const date = new Intl.DateTimeFormat("en-KE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function RetailerOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      setOrders(await getMyOrders(token));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your orders.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filteredOrders =
    status === "ALL"
      ? orders
      : orders.filter((order) => order.status.toUpperCase() === status);

  return (
    <DashboardLayout navItems={retailerNavItems}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#003049]">My Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review your wholesale order history.
          </p>
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border bg-white px-3 py-2 text-sm"
        >
          {STATUSES.map((option) => (
            <option key={option} value={option}>
              {option === "ALL" ? "All statuses" : orderStatusLabels[option]}
            </option>
          ))}
        </select>
      </div>

      {error && !isLoading && (
        <ErrorState message={error} onRetry={() => void loadOrders()} />
      )}

      {!error && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonTableRow key={index} columns={6} />
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No orders match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const normalized = order.status.toUpperCase();

                    const itemQuantity = order.orderItems.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    );

                    return (
                      <tr
                        key={order.order_id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-[#003049]">
                          #{order.order_id}
                        </td>
                        <td className="px-4 py-3">{itemQuantity}</td>
                        <td className="px-4 py-3">
                          {currency.format(Number(order.total_amount))}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {date.format(new Date(order.order_date))}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              statusColors[normalized] ??
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {orderStatusLabels[normalized] ?? order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/dashboard/retailer/orders/${order.order_id}`}
                            className="font-medium text-[#f77f00] hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

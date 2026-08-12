import { useCallback, useEffect, useState } from "react";
import { Eye, RefreshCw, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { retailerNavItems } from "../../config/retailerNav";
import { statusColors } from "../../config/orderStatusColors";
import { useAuth } from "../../context/AuthContext";
import { getMyOrders, type Order } from "../../services/orderService";

const placeholderRecentOrders = [
  {
    id: 1,
    items: 3,
    total: "Ksh 4,200",
    status: "Pending",
    date: "2026-07-13",
  },
  {
    id: 2,
    items: 1,
    total: "Ksh 1,200",
    status: "Dispatched",
    date: "2026-07-12",
  },
  {
    id: 3,
    items: 5,
    total: "Ksh 8,900",
    status: "Completed",
    date: "2026-07-10",
  },
];

export default function RetailerDashboard() {
  const { token } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await getMyOrders(token);

      setOrders(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const pendingOrders = orders.filter(
    (order) => order.status.toUpperCase() === "PENDING",
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status.toUpperCase() === "DELIVERED",
  ).length;

  const totalSpent = orders
    .filter((order) => order.status.toUpperCase() !== "CANCELLED")
    .reduce((total, order) => total + Number(order.total_amount), 0);

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
    },
    {
      label: "Delivered Orders",
      value: deliveredOrders,
    },
    {
      label: "Total Spent (Ksh)",
      value: totalSpent.toLocaleString(),
    },
  ];

  return (
    <DashboardLayout navItems={retailerNavItems}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#003049]">Overview</h1>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadDashboard}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#003049] hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>

          <Link
            to="/dashboard/retailer/browse"
            className="flex items-center gap-2 rounded-lg bg-[#f77f00] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d62828]"
          >
            <ShoppingBag size={16} />
            Browse Products
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-3 text-sm text-red-700">
          <p>{error}</p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-2 font-medium underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">{stat.label}</p>

            <p className="mt-1 text-2xl font-bold text-[#003049]">
              {isLoading ? "—" : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-[#003049]">Recent Orders</h2>

          <Link
            to="/dashboard/retailer/orders"
            className="flex items-center gap-1 text-sm font-medium text-[#f77f00] hover:underline"
          >
            <Eye size={14} />
            View All
          </Link>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2">Order ID</th>
              <th className="pb-2">Items</th>
              <th className="pb-2">Total</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {placeholderRecentOrders.map((order) => (
              <tr key={order.id} className="border-b last:border-b-0">
                <td className="py-2">#{order.id}</td>
                <td className="py-2">{order.items}</td>
                <td className="py-2">{order.total}</td>
                <td className="py-2 text-gray-500">{order.date}</td>
                <td className="py-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

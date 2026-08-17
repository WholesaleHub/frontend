import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { Order } from "../../services/orderService";

type RecentOrdersTableProps = {
  orders: Order[];
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PACKED: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-KE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function getItemQuantity(order: Order): number {
  return order.orderItems.reduce((total, item) => total + item.quantity, 0);
}

function formatAmount(amount: string): string {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "—";
  }

  return currencyFormatter.format(numericAmount);
}

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return dateFormatter.format(parsedDate);
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <section className="mt-6 overflow-hidden rounded-lg bg-white shadow">
      <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-[#003049]">Recent Orders</h2>

          <p className="mt-1 text-sm text-gray-500">
            Your five most recently placed orders.
          </p>
        </div>

        <Link
          to="/dashboard/retailer/orders"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#f77f00] hover:underline"
        >
          <Eye size={15} />
          View all
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="font-medium text-[#003049]">No orders yet</p>

          <p className="mt-1 text-sm text-gray-500">
            Your recent orders will appear here after you complete checkout.
          </p>

          <Link
            to="/dashboard/retailer/browse"
            className="mt-4 inline-flex rounded-lg bg-[#f77f00] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d62828]"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const normalizedStatus = order.status.toUpperCase();

                return (
                  <tr
                    key={order.order_id}
                    className="border-t last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-[#003049]">
                      #{order.order_id}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(order.order_date)}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {getItemQuantity(order)}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-800">
                      {formatAmount(order.total_amount)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          STATUS_COLORS[normalizedStatus] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {STATUS_LABELS[normalizedStatus] ?? order.status}
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
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

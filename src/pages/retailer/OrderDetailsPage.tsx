import { ArrowLeft, CheckCircle2, LoaderCircle, Package } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { retailerNavItems } from "../../config/retailerNav";
import { wholesalerNavItems } from "../../config/wholesalerNav";
import {
  orderStatusLabels,
  statusColors,
} from "../../config/orderStatusColors";
import { useAuth } from "../../context/AuthContext";
import {
  getOrderById,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "../../services/orderService";
import ErrorState from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";

const orderStatuses: OrderStatus[] = [
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
  dateStyle: "medium",
  timeStyle: "short",
});

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");

  const isWholesaler = user?.role === "WHOLESALER";
  const navItems = isWholesaler ? wholesalerNavItems : retailerNavItems;
  const ordersPath = isWholesaler
    ? "/dashboard/wholesaler/orders"
    : "/dashboard/retailer/orders";

  const loadOrder = useCallback(async () => {
    if (!id || !token) {
      setError("Invalid order request.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await getOrderById(id, token);
      setOrder(data);
      setSelectedStatus(data.status);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load the order.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  async function handleStatusUpdate() {
    if (!order || !token || selectedStatus === order.status) return;

    setIsUpdating(true);
    setStatusError("");
    setStatusSuccess("");

    try {
      const updatedOrder = await updateOrderStatus(
        token,
        order.order_id,
        selectedStatus,
      );

      setOrder((current) =>
        current
          ? {
              ...current,
              status: updatedOrder.status ?? selectedStatus,
            }
          : current,
      );

      setStatusSuccess("Order status updated successfully.");
    } catch (err) {
      setSelectedStatus(order.status);
      setStatusError(
        err instanceof Error
          ? err.message
          : "Failed to update the order status.",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  const normalizedStatus = order?.status.toUpperCase() ?? "";

  return (
    <DashboardLayout navItems={navItems}>
      <Link
        to={ordersPath}
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#003049] hover:text-[#f77f00]"
      >
        <ArrowLeft size={17} />
        Back to orders
      </Link>

      {isLoading && (
        <div className="space-y-4 rounded-lg bg-white p-6 shadow">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {!isLoading && error && (
        <ErrorState
          title="Order unavailable"
          message={error}
          onRetry={() => void loadOrder()}
        />
      )}

      {!isLoading && !error && order && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="flex flex-col gap-4 border-b p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Package size={34} className="shrink-0 text-[#003049]" />

              <div>
                <h1 className="text-2xl font-bold text-[#003049]">
                  Order #{order.order_id}
                </h1>
                <p className="text-sm text-gray-500">
                  {date.format(new Date(order.order_date))}
                </p>
              </div>
            </div>

            {isWholesaler ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label htmlFor="order-status" className="sr-only">
                  Order status
                </label>

                <select
                  id="order-status"
                  value={selectedStatus}
                  disabled={isUpdating}
                  onChange={(event) => {
                    setSelectedStatus(event.target.value as OrderStatus);
                    setStatusError("");
                    setStatusSuccess("");
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#f77f00] focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {orderStatusLabels[status]}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => void handleStatusUpdate()}
                  disabled={isUpdating || selectedStatus === order.status}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#f77f00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d62828] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isUpdating ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update status"
                  )}
                </button>
              </div>
            ) : (
              <span
                className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
                  statusColors[normalizedStatus] ?? "bg-gray-100 text-gray-700"
                }`}
              >
                {orderStatusLabels[normalizedStatus] ?? order.status}
              </span>
            )}
          </div>

          {isWholesaler && (statusError || statusSuccess) && (
            <div
              className={`mx-6 mt-4 rounded-lg px-4 py-3 text-sm ${
                statusError
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
              role={statusError ? "alert" : "status"}
            >
              {statusSuccess && (
                <CheckCircle2 size={16} className="mr-2 inline-block" />
              )}
              {statusError || statusSuccess}
            </div>
          )}

          {isWholesaler && order.customer && (
            <section className="grid gap-4 border-b bg-gray-50 px-6 py-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs uppercase text-gray-400">Business</p>
                <p className="font-medium text-[#003049]">
                  {order.customer.business_name}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-400">
                  Contact person
                </p>
                <p className="font-medium text-gray-700">
                  {order.customer.contact_person || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-400">Phone</p>
                <p className="font-medium text-gray-700">
                  {order.customer.phone || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-400">Location</p>
                <p className="font-medium text-gray-700">
                  {order.customer.business_location || "Not provided"}
                </p>
              </div>
            </section>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Quantity</th>
                  <th className="px-6 py-3 font-medium">Unit price</th>
                  <th className="px-6 py-3 text-right font-medium">Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {order.orderItems.map((item) => (
                  <tr key={item.order_item_id} className="border-t">
                    <td className="px-6 py-4 font-medium text-[#003049]">
                      {item.product?.product_name ??
                        `Product #${item.product_id}`}
                    </td>
                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4">
                      {currency.format(Number(item.unit_price))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {currency.format(Number(item.subtotal))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end border-t bg-gray-50 p-6">
            <div className="text-right">
              <p className="text-sm text-gray-500">Order total</p>
              <p className="text-2xl font-bold text-[#003049]">
                {currency.format(Number(order.total_amount))}
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

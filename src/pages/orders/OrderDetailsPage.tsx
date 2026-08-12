import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";
import { retailerNavItems } from "../../config/retailerNav";
import { useAuth } from "../../context/AuthContext";
import {
  getOrderById,
  updateOrderStatus,
  type Order,
} from "../../services/orderService";
import { statusColors } from "../../config/orderStatusColors";
import { Skeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import OrderStatusTracker from "../../components/ui/OrderStatusTracker";
import ShopLocationViewer from "../../components/maps/ShopLocationViewer";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const ALLOWED_NEXT_STATUSES: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const isWholesaler = user?.role.toLowerCase() === "wholesaler";
  const navItems = isWholesaler ? wholesalerNavItems : retailerNavItems;
  const backPath = isWholesaler
    ? "/dashboard/wholesaler/orders"
    : "/dashboard/retailer/orders";

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id || !token) return;
    setIsLoading(true);
    setError("");
    try {
      setOrder(await getOrderById(id, token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order.");
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  async function confirmStatusChange() {
    if (!token || !order || !pendingStatus) return;
    setIsUpdating(true);
    try {
      await updateOrderStatus(token, order.order_id, pendingStatus);

      await fetchOrder();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update order status.",
      );
    } finally {
      setIsUpdating(false);
      setPendingStatus(null);
    }
  }

  const customerLatitude =
    order?.customer?.latitude == null ? null : Number(order.customer.latitude);

  const customerLongitude =
    order?.customer?.longitude == null
      ? null
      : Number(order.customer.longitude);

  const hasValidLocation =
    customerLatitude !== null &&
    customerLongitude !== null &&
    Number.isFinite(customerLatitude) &&
    Number.isFinite(customerLongitude);

  return (
    <DashboardLayout navItems={navItems}>
      <button
        onClick={() => navigate(backPath)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#003049] mb-6"
      >
        <ArrowLeft size={16} /> Back to Orders
      </button>

      {isLoading && (
        <div className="bg-white rounded-lg shadow p-8 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!isLoading && error && (
        <ErrorState
          title="Order Not Found"
          message={error}
          onRetry={fetchOrder}
        />
      )}

      {!isLoading && !error && order && (
        <div className="bg-white rounded-lg shadow p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#003049]">
                Order #{order.order_id}
              </h1>
              <p className="text-sm text-gray-500">
                {new Date(order.order_date).toLocaleString()}
              </p>
              {order.customer?.business_name && (
                <p className="text-sm text-gray-500 mt-1">
                  Customer: {order.customer.business_name}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-3">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                  statusColors[
                    ORDER_STATUS_LABELS[order.status.toUpperCase()] ??
                      order.status
                  ] ?? "bg-gray-100 text-gray-700"
                }`}
              >
                {ORDER_STATUS_LABELS[order.status.toUpperCase()] ??
                  order.status}
              </span>
            </div>
          </div>
          <div className="mb-8">
            <OrderStatusTracker status={order.status} />
          </div>
          <section className="mb-8 rounded-lg border bg-gray-50 p-4">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-[#003049]">
              <MapPin size={18} className="text-[#f77f00]" />
              Delivery Information
            </h2>

            <div className="mb-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-400">Business location</p>
                <p className="text-gray-700">
                  {order.customer?.business_location ?? "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Contact phone</p>
                <p className="text-gray-700">
                  {order.customer?.phone ?? "Not provided"}
                </p>
              </div>

              {order.customer?.delivery_notes && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-400">Delivery instructions</p>
                  <p className="text-gray-700">
                    {order.customer.delivery_notes}
                  </p>
                </div>
              )}
            </div>

            {hasValidLocation ? (
              <ShopLocationViewer
                latitude={customerLatitude}
                longitude={customerLongitude}
                businessName={order.customer?.business_name ?? "Customer"}
              />
            ) : (
              <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
                This retailer has not pinned a delivery location.
              </p>
            )}
          </section>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Product</th>
                <th className="pb-2">Qty</th>
                <th className="pb-2">Unit Price</th>
                <th className="pb-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item) => (
                <tr
                  key={item.order_item_id}
                  className="border-b last:border-b-0"
                >
                  <td className="py-2">
                    {item.product?.product_name ??
                      `Product #${item.product_id}`}
                  </td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2">
                    Ksh {Number(item.unit_price).toLocaleString()}
                  </td>
                  <td className="py-2 font-medium">
                    Ksh {Number(item.subtotal).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-6">
            <p className="text-xl font-bold text-[#f77f00]">
              Total: Ksh {Number(order.total_amount).toLocaleString()}
            </p>
          </div>

          {isWholesaler &&
            ALLOWED_NEXT_STATUSES[order.status.toUpperCase()]?.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-[#003049] mb-2">
                  Update Status
                </p>
                <div className="flex gap-2 flex-wrap">
                  {ALLOWED_NEXT_STATUSES[order.status.toUpperCase()].map(
                    (next) => (
                      <button
                        key={next}
                        onClick={() => setPendingStatus(next)}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
                      >
                        Mark as {ORDER_STATUS_LABELS[next]}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!pendingStatus}
        title="Update Order Status"
        message={`Change this order's status to "${pendingStatus ? ORDER_STATUS_LABELS[pendingStatus] : ""}"?`}
        confirmLabel={isUpdating ? "Updating..." : "Confirm"}
        onConfirm={confirmStatusChange}
        onCancel={() => setPendingStatus(null)}
      />
    </DashboardLayout>
  );
}

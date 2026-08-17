import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Building2, Mail, MapPin, Phone, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";
import { useAuth } from "../../context/AuthContext";
import {
  getCustomerById,
  resolveCustomerImageUrl,
  type CustomerDetails,
} from "../../services/customerService";
import { statusColors } from "../../config/orderStatusColors";
import ErrorState from "../../components/ui/ErrorState";
import ShopLocationViewer from "../../components/maps/ShopLocationViewer";
const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
export default function CustomerDetailsPage() {
  const { id } = useParams();
  const { token } = useAuth();

  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomer = useCallback(async () => {
    const customerId = Number(id);

    if (!token || !Number.isInteger(customerId) || customerId <= 0) {
      setError("Invalid customer ID.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setCustomer(await getCustomerById(token, customerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customer.");
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  const customerProfileImage = resolveCustomerImageUrl(
    customer?.profile_image_url,
  );

  return (
    <DashboardLayout navItems={wholesalerNavItems}>
      <Link
        to="/dashboard/wholesaler/customers"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#003049]"
      >
        <ArrowLeft size={16} />
        Back to customers
      </Link>

      {error && <ErrorState message={error} onRetry={loadCustomer} />}

      {isLoading && !error && (
        <div className="rounded-lg bg-white p-10 text-center text-gray-400 shadow">
          Loading customer details...
        </div>
      )}

      {!isLoading && !error && customer && (
        <>
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-lg bg-white p-5 shadow sm:flex-row sm:items-start">
            <div className="flex items-center gap-4">
              {customerProfileImage ? (
                <a
                  href={customerProfileImage}
                  target="_blank"
                  rel="noreferrer"
                  title="Open profile picture"
                >
                  <img
                    src={customerProfileImage}
                    alt={`${customer.business_name} profile`}
                    className="h-20 w-20 rounded-full border object-cover shadow-sm"
                  />
                </a>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f77f00] text-white">
                  <User size={32} />
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold text-[#003049]">
                  {customer.business_name}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Customer #{customer.customer_id}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                  customer.status.toUpperCase() === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {customer.status}
              </span>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="mt-1 text-2xl font-bold text-[#003049]">
                {customer.summary.totalOrders}
              </p>
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-500">Active Orders</p>
              <p className="mt-1 text-2xl font-bold text-[#003049]">
                {customer.summary.activeOrders}
              </p>
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="mt-1 text-2xl font-bold text-[#003049]">
                Ksh {customer.summary.totalSpent.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-lg bg-white p-5 shadow">
              <h2 className="mb-4 font-semibold text-[#003049]">
                Business Information
              </h2>

              <div className="space-y-4 text-sm">
                <DetailRow
                  icon={Building2}
                  label="Business name"
                  value={customer.business_name}
                />
                <DetailRow
                  icon={MapPin}
                  label="Location"
                  value={customer.business_location}
                />
                <DetailRow
                  icon={User}
                  label="Contact person"
                  value={customer.contact_person}
                />
                <DetailRow icon={Phone} label="Phone" value={customer.phone} />
                {customer.delivery_notes && (
                  <DetailRow
                    icon={MapPin}
                    label="Delivery instructions"
                    value={customer.delivery_notes}
                  />
                )}
              </div>
            </section>

            <section className="rounded-lg bg-white p-5 shadow">
              <h2 className="mb-4 font-semibold text-[#003049]">
                Account Information
              </h2>

              <div className="space-y-4 text-sm">
                <DetailRow
                  icon={User}
                  label="Account name"
                  value={customer.user.full_name}
                />
                <DetailRow
                  icon={Mail}
                  label="Email"
                  value={customer.user.email}
                />
                <DetailRow
                  icon={Building2}
                  label="Account status"
                  value={customer.user.status}
                />
              </div>
            </section>
          </div>
          <section className="mb-6 rounded-lg bg-white p-5 shadow">
            {customer.latitude !== null && customer.longitude !== null ? (
              <ShopLocationViewer
                latitude={customer.latitude}
                longitude={customer.longitude}
                businessName={customer.business_name}
              />
            ) : (
              <div className="py-8 text-center">
                <MapPin size={32} className="mx-auto mb-2 text-gray-300" />

                <h2 className="font-semibold text-[#003049]">
                  Shop Delivery Location
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  This retailer has not pinned their shop location yet.
                </p>
              </div>
            )}
          </section>

          <section className="mb-6 rounded-lg bg-white p-5 shadow">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[#003049]">Shop Images</h2>

                <p className="mt-1 text-xs text-gray-500">
                  Images provided by the retailer to help identify the delivery
                  location.
                </p>
              </div>

              <span className="text-sm text-gray-400">
                {customer.shop_images.length} image
                {customer.shop_images.length === 1 ? "" : "s"}
              </span>
            </div>

            {customer.shop_images.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed p-8 text-center text-sm text-gray-400">
                No shop images have been uploaded.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {customer.shop_images.map((image) => {
                  const imageUrl = resolveCustomerImageUrl(image.image_url);

                  if (!imageUrl) {
                    return null;
                  }

                  return (
                    <a
                      key={image.shop_image_id}
                      href={imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group block overflow-hidden rounded-lg border bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#f77f00]"
                    >
                      <img
                        src={imageUrl}
                        alt={`${customer.business_name} shop`}
                        className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105"
                      />

                      <p className="p-2 text-center text-xs text-gray-500">
                        Click to view full image
                      </p>
                    </a>
                  );
                })}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-lg bg-white shadow">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-semibold text-[#003049]">Order History</h2>

              <span className="text-sm text-gray-400">
                {customer.orders.length} orders
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-500">
                    <th className="p-3">Order</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {customer.orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        This customer has no orders.
                      </td>
                    </tr>
                  ) : (
                    customer.orders.map((order) => {
                      const status = order.status.toUpperCase();

                      return (
                        <tr
                          key={order.order_id}
                          className="border-b last:border-b-0 hover:bg-gray-50"
                        >
                          <td className="p-3 font-medium text-[#003049]">
                            #{order.order_id}
                          </td>
                          <td className="p-3 text-gray-500">
                            {new Date(order.order_date).toLocaleDateString()}
                          </td>
                          <td className="p-3">{order.orderItems.length}</td>
                          <td className="p-3">
                            Ksh {Number(order.total_amount).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                statusColors[
                                  ORDER_STATUS_LABELS[status] ?? status
                                ] ?? "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {ORDER_STATUS_LABELS[status] ?? order.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <Link
                              to={`/orders/${order.order_id}`}
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
          </section>
        </>
      )}
    </DashboardLayout>
  );
}

type DetailRowProps = {
  icon: typeof Building2;
  label: string;
  value: string;
};

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="mt-0.5 text-[#f77f00]" />

      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-gray-700">{value}</p>
      </div>
    </div>
  );
}

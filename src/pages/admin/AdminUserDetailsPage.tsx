import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  ShoppingBag,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import ErrorState from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";
import { adminNavItems } from "../../config/adminNav";
import { useAuth } from "../../context/AuthContext";
import {
  findCustomerByUserId,
  getCustomerOrders,
  type CustomerProfile,
} from "../../services/customerService";
import type { Order, OrderStatus } from "../../services/orderService";
import { getUserById, type AdminUser } from "../../services/userService";

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

const dateTimeFormatter = new Intl.DateTimeFormat("en-KE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PACKED: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const orderStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminUserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const [account, setAccount] = useState<AdminUser | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDetails = useCallback(async () => {
    if (!token || !id) {
      setError("The requested user account is unavailable.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const accountData = await getUserById(token, id);

      setAccount(accountData);
      setCustomer(null);
      setOrders([]);

      if (accountData.role === "RETAILER") {
        const customerData = await findCustomerByUserId(token, id);

        setCustomer(customerData);

        if (customerData) {
          setOrders(await getCustomerOrders(token, customerData.customer_id));
        }
      }
    } catch (loadError) {
      setAccount(null);
      setCustomer(null);
      setOrders([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load the user details.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  const completedSales = useMemo(
    () => orders.filter((order) => order.status !== "CANCELLED"),
    [orders],
  );

  const lifetimeSpend = useMemo(
    () =>
      completedSales.reduce(
        (total, order) => total + Number(order.total_amount),
        0,
      ),
    [completedSales],
  );

  const averageOrderValue =
    completedSales.length > 0 ? lifetimeSpend / completedSales.length : 0;

  const latestOrder = orders[0] ?? null;

  return (
    <DashboardLayout navItems={adminNavItems}>
      <Link
        to="/dashboard/admin/users"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#003049] hover:text-[#f77f00]"
      >
        <ArrowLeft size={17} />
        Back to users
      </Link>

      {isLoading && <DetailsSkeleton />}

      {!isLoading && error && (
        <ErrorState
          title="User unavailable"
          message={error}
          onRetry={() => void loadDetails()}
        />
      )}

      {!isLoading && !error && account && (
        <>
          <header className="mb-6 rounded-lg bg-white p-6 shadow">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-blue-50 p-3 text-[#003049]">
                  <UserRound size={28} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-[#003049]">
                    {account.full_name}
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    {account.role.toLowerCase()} account
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusBadge active={account.status === "ACTIVE"}>
                  {account.status === "ACTIVE" ? "Active" : "Inactive"}
                </StatusBadge>

                {customer && (
                  <StatusBadge active={customer.status === "ACTIVE"}>
                    Business {customer.status.toLowerCase()}
                  </StatusBadge>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
              <InformationItem
                icon={<Mail size={17} />}
                label="Email address"
                value={account.email}
              />

              <InformationItem
                icon={<Phone size={17} />}
                label="Phone number"
                value={account.phone || "Not provided"}
              />

              <InformationItem
                icon={<CalendarDays size={17} />}
                label="Joined"
                value={dateFormatter.format(new Date(account.created_at))}
              />

              <InformationItem
                icon={<UserRound size={17} />}
                label="User ID"
                value={account.id}
              />
            </div>
          </header>

          {account.role === "RETAILER" && customer && (
            <>
              <section className="mb-6 rounded-lg bg-white p-6 shadow">
                <div className="mb-5 flex items-center gap-2">
                  <Building2 size={20} className="text-[#f77f00]" />
                  <h2 className="font-semibold text-[#003049]">
                    Business profile
                  </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <InformationItem
                    icon={<Building2 size={17} />}
                    label="Business name"
                    value={customer.business_name}
                  />

                  <InformationItem
                    icon={<UserRound size={17} />}
                    label="Contact person"
                    value={customer.contact_person}
                  />

                  <InformationItem
                    icon={<MapPin size={17} />}
                    label="Business location"
                    value={customer.business_location}
                  />

                  <InformationItem
                    icon={<Phone size={17} />}
                    label="Business phone"
                    value={customer.phone}
                  />
                </div>
              </section>

              <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  icon={<ShoppingBag size={20} />}
                  label="Total orders"
                  value={String(orders.length)}
                />

                <MetricCard
                  icon={<WalletCards size={20} />}
                  label="Lifetime spend"
                  value={currencyFormatter.format(lifetimeSpend)}
                />

                <MetricCard
                  icon={<ReceiptText size={20} />}
                  label="Average order value"
                  value={currencyFormatter.format(averageOrderValue)}
                />

                <MetricCard
                  icon={<CalendarDays size={20} />}
                  label="Last order"
                  value={
                    latestOrder
                      ? dateFormatter.format(new Date(latestOrder.order_date))
                      : "No orders"
                  }
                />
              </section>

              <section className="mb-6 rounded-lg bg-white p-6 shadow">
                <h2 className="font-semibold text-[#003049]">
                  Orders by status
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {orderStatuses.map((status) => (
                    <div
                      key={status}
                      className="rounded-lg border bg-gray-50 p-3"
                    >
                      <p className="text-xs text-gray-500">
                        {formatLabel(status)}
                      </p>
                      <p className="mt-1 text-xl font-bold text-[#003049]">
                        {
                          orders.filter((order) => order.status === status)
                            .length
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <RecentOrders orders={orders.slice(0, 15)} />
            </>
          )}

          {account.role === "RETAILER" && !customer && (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-6">
              <h2 className="font-semibold text-amber-900">
                Business profile unavailable
              </h2>
              <p className="mt-2 text-sm text-amber-800">
                This retailer account is not currently linked to a customer
                profile, so order and spending analytics cannot be displayed.
              </p>
            </section>
          )}

          {account.role === "WHOLESALER" && (
            <section className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h2 className="font-semibold text-[#003049]">
                Seller analytics unavailable
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-blue-800">
                Products and order items are not currently assigned to an
                individual wholesaler in the backend. Showing platform-wide
                revenue here would incorrectly represent it as this seller's
                performance.
              </p>
              <p className="mt-2 max-w-3xl text-sm text-blue-800">
                Product ownership and seller-specific revenue should be added by
                the backend team before these analytics are enabled.
              </p>
            </section>
          )}

          {account.role === "ADMIN" && (
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow">
              <h2 className="font-semibold text-[#003049]">
                Administrator account
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                This profile contains administrative account information.
                Customer spending and seller revenue do not apply to this role.
              </p>
            </section>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <section className="overflow-hidden rounded-lg bg-white shadow">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold text-[#003049]">Recent orders</h2>
        <p className="mt-1 text-sm text-gray-500">
          The 15 most recent orders placed by this retailer.
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-gray-500">
          This retailer has not placed any orders.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/dashboard/admin/orders/${order.order_id}`}
                      className="font-medium text-[#003049] hover:text-[#f77f00] hover:underline"
                    >
                      #{order.order_id}
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {dateTimeFormatter.format(new Date(order.order_date))}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {order.orderItems.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusStyles[order.status]
                      }`}
                    >
                      {formatLabel(order.status)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right font-medium text-[#003049]">
                    {currencyFormatter.format(Number(order.total_amount))}
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

function InformationItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <p className="text-xs uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 break-words text-sm font-medium text-[#003049]">
        {value}
      </p>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-white p-5 shadow">
      <div className="flex items-center justify-between text-gray-400">
        <p className="text-sm">{label}</p>
        <span className="text-[#f77f00]">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-[#003049]">{value}</p>
    </div>
  );
}

function StatusBadge({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {children}
    </span>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <Skeleton className="mb-3 h-8 w-56" />
        <Skeleton className="h-4 w-36" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

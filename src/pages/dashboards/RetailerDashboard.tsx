import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { retailerNavItems } from "../../config/retailerNav";
import { useAuth } from "../../context/AuthContext";
import {
  getCustomerDashboard,
  type CustomerDashboardStats,
} from "../../services/dashboardService";
import ErrorState from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";
import RecentOrdersTable from "../../components/orders/RecentOrdersTable";

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  valueClassName?: string;
};

function StatCard({
  label,
  value,
  icon,
  valueClassName = "text-[#003049]",
}: StatCardProps) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        {icon}
      </div>

      <p className={`text-2xl font-bold ${valueClassName}`}>{value}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="rounded-lg bg-white p-4 shadow">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5" />
          </div>

          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export default function RetailerDashboard() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<CustomerDashboardStats | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!token) {
      setError("Your session is unavailable. Please log in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await getCustomerDashboard(token);
      setDashboard(data);
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

  return (
    <DashboardLayout navItems={retailerNavItems}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#003049]">Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track the progress of your wholesale orders.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#003049] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>

          <Link
            to="/dashboard/retailer/browse"
            className="inline-flex items-center gap-2 rounded-lg bg-[#f77f00] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d62828]"
          >
            <ShoppingBag size={16} />
            Browse Products
          </Link>
        </div>
      </div>

      {error && !isLoading && (
        <ErrorState message={error} onRetry={() => void loadDashboard()} />
      )}

      {!error && isLoading && <DashboardSkeleton />}

      {!error && !isLoading && dashboard && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Orders"
              value={dashboard.totalOrders}
              icon={<ShoppingBag size={20} className="text-[#003049]" />}
            />

            <StatCard
              label="Pending"
              value={dashboard.pendingOrders}
              icon={<Clock3 size={20} className="text-amber-500" />}
              valueClassName="text-amber-600"
            />

            <StatCard
              label="Confirmed"
              value={dashboard.confirmedOrders}
              icon={<CheckCircle2 size={20} className="text-blue-500" />}
              valueClassName="text-blue-600"
            />

            <StatCard
              label="Packed"
              value={dashboard.packedOrders}
              icon={<PackageOpen size={20} className="text-indigo-500" />}
              valueClassName="text-indigo-600"
            />

            <StatCard
              label="Shipped"
              value={dashboard.shippedOrders}
              icon={<Truck size={20} className="text-purple-500" />}
              valueClassName="text-purple-600"
            />

            <StatCard
              label="Delivered"
              value={dashboard.deliveredOrders}
              icon={<PackageCheck size={20} className="text-green-500" />}
              valueClassName="text-green-600"
            />

            <StatCard
              label="Cancelled"
              value={dashboard.cancelledOrders}
              icon={<XCircle size={20} className="text-red-500" />}
              valueClassName="text-red-600"
            />
          </div>

          <RecentOrdersTable orders={dashboard.recentOrders} />
        </>
      )}
    </DashboardLayout>
  );
}

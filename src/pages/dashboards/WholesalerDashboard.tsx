import { AlertTriangle, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";
import { useAuth } from "../../context/AuthContext";
import {
  getDashboardStats,
  type DashboardStats,
} from "../../services/dashboardService";
import { getProducts, type Product } from "../../services/productService";
import { Skeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";

const REFRESH_INTERVAL_MS = 60_000;

export default function WholesalerDashboard() {
  const { token } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!token) {
      setError("Your session is unavailable. Please log in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [statsData, productsResponse] = await Promise.all([
        getDashboardStats(token),
        getProducts(token, { limit: 100 }),
      ]);

      setStats(statsData);

      setLowStockItems(
        productsResponse.data
          .filter(
            (product) =>
              product.stock_status === "LOW_STOCK" ||
              product.stock_status === "OUT_OF_STOCK",
          )
          .slice(0, 6),
      );

      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load the dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadDashboard();

    const interval = window.setInterval(() => {
      void loadDashboard();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadDashboard]);

  return (
    <DashboardLayout navItems={wholesalerNavItems}>
      <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#003049]">Overview</h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor products, categories and stock levels.
          </p>
        </div>

        <Link
          to="/dashboard/wholesaler/products/new"
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#f77f00] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d62828]"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={isLoading}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#003049] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>

        {lastUpdated && (
          <span className="text-xs text-gray-400">
            Last updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {error && !isLoading && (
        <ErrorState message={error} onRetry={() => void loadDashboard()} />
      )}

      {!error && (
        <>
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {isLoading || !stats ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-lg bg-white p-4 shadow">
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))
            ) : (
              <>
                <StatCard label="Total Products" value={stats.totalProducts} />

                <StatCard
                  label="Total Categories"
                  value={stats.totalCategories}
                />

                <StatCard
                  label="Low Stock Items"
                  value={stats.lowStockProducts}
                  valueClassName="text-[#d62828]"
                />
              </>
            )}
          </section>

          <section className="rounded-lg bg-white p-4 shadow">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#d62828]" />

              <div>
                <h2 className="font-semibold text-[#003049]">
                  Products Needing Attention
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Low-stock and out-of-stock products.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : lowStockItems.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed px-4 py-10 text-center">
                <p className="text-sm font-medium text-[#003049]">
                  Stock levels look healthy
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  No products currently require attention.
                </p>
              </div>
            ) : (
              <ul>
                {lowStockItems.map((item) => (
                  <li
                    key={item.product_id}
                    className="flex flex-col gap-2 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Link
                        to={`/products/${item.product_id}`}
                        className="text-sm font-medium text-[#003049] hover:underline"
                      >
                        {item.product_name}
                      </Link>

                      <p className="mt-1 text-xs text-gray-500">
                        SKU: {item.sku}
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-[#d62828]">
                      {item.stock_quantity} remaining
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </DashboardLayout>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  valueClassName?: string;
};

function StatCard({
  label,
  value,
  valueClassName = "text-[#003049]",
}: StatCardProps) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <p className="text-sm text-gray-500">{label}</p>

      <p className={`mt-1 text-2xl font-bold ${valueClassName}`}>{value}</p>
    </div>
  );
}

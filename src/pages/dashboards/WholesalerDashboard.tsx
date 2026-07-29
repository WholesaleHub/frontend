import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Plus, Eye, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats, type DashboardStats } from "../../services/dashboardService";
import { getProducts, type Product } from "../../services/productService";
import { Skeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";

const REFRESH_INTERVAL_MS = 60000;

// Sample data — replace once Orders/Revenue endpoints exist on the backend
const revenueData = [
  { day: "Mon", revenue: 32000 }, { day: "Tue", revenue: 41000 }, { day: "Wed", revenue: 28000 },
  { day: "Thu", revenue: 55000 }, { day: "Fri", revenue: 47000 }, { day: "Sat", revenue: 62000 }, { day: "Sun", revenue: 39000 },
];
const demandData = [
  { product: "Milk", unitsSold: 320 }, { product: "Rice 50kg", unitsSold: 85 },
  { product: "Cooking Oil", unitsSold: 140 }, { product: "Sugar", unitsSold: 210 }, { product: "Flour", unitsSold: 95 },
];
const stockDataSample = [
  { name: "In Stock", value: 38 }, { name: "Low Stock", value: 5 }, { name: "Out of Stock", value: 5 },
];
const STOCK_COLORS = ["#f77f00", "#fcbf49", "#d62828"];

function SampleBadge() {
  return (
    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-2">
      Preview data
    </span>
  );
}

export default function WholesalerDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    setError("");
    try {
      const [statsData, productsResponse] = await Promise.all([
  getDashboardStats(token),
  getProducts(token, { limit: 100 }),
]);
setStats(statsData);
setLowStockItems(
  productsResponse.data
    .filter((p) => p.stock_status === "LOW_STOCK" || p.stock_status === "OUT_OF_STOCK")
    .slice(0, 6)
);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  return (
    <DashboardLayout navItems={wholesalerNavItems}>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-[#003049]">Overview</h1>
        <div className="flex gap-2">
          <Link to="/dashboard/wholesaler/products" className="flex items-center gap-2 bg-[#f77f00] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d62828] transition-colors">
            <Plus size={16} /> Add Product
          </Link>
          <Link to="/dashboard/wholesaler/orders" className="flex items-center gap-2 bg-white border border-gray-300 text-[#003049] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Eye size={16} /> View All Orders
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <button onClick={loadDashboard} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#003049]">
          <RefreshCw size={12} /> Refresh
        </button>
        {lastUpdated && <span className="text-xs text-gray-400">Last updated {lastUpdated.toLocaleTimeString()}</span>}
      </div>

      {error && <ErrorState message={error} onRetry={loadDashboard} />}

      {!error && (
        <>
          {/* Real stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {isLoading || !stats ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))
            ) : (
              <>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-[#003049] mt-1">{stats.totalProducts}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500">Total Categories</p>
                  <p className="text-2xl font-bold text-[#003049] mt-1">{stats.totalCategories}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500">Low Stock Items</p>
                  <p className="text-2xl font-bold text-[#d62828] mt-1">{stats.lowStockProducts}</p>
                </div>
              </>
            )}
          </div>

          {/* Sample charts — swap for real data once Orders/Revenue endpoints exist */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="font-semibold mb-4 text-[#003049] flex items-center">
              Revenue Trend (This Week) <SampleBadge />
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#f77f00" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-4 text-[#003049] flex items-center">
                Product Demand (Units Sold) <SampleBadge />
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={demandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="unitsSold" fill="#f77f00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-4 text-[#003049] flex items-center">
                Stock Status <SampleBadge />
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={stockDataSample} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {stockDataSample.map((entry, index) => (
                      <Cell key={entry.name} fill={STOCK_COLORS[index % STOCK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real low-stock list */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4 text-[#003049] flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#d62828]" />
              Products Needing Attention
            </h2>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : lowStockItems.length === 0 ? (
              <p className="text-sm text-gray-400">No products are currently low on stock.</p>
            ) : (
              <ul>
                {lowStockItems.map((item) => (
                  <li key={item.product_id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <Link to={`/products/${item.product_id}`} className="text-sm text-gray-700 hover:underline">
                      {item.product_name}
                    </Link>
                    <span className="text-sm font-semibold text-[#d62828]">{item.stock_quantity} left</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
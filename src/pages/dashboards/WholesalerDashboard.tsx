import { AlertTriangle, Plus, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";
import { statusColors } from "../../config/orderStatusColors";

const stats = [
  { label: "Total Products", value: 48 },
  { label: "Orders Today", value: 12 },
  { label: "Low Stock Items", value: 5 },
  { label: "Total Revenue (Ksh)", value: "234,500" },
];

const revenueData = [
  { day: "Mon", revenue: 32000 },
  { day: "Tue", revenue: 41000 },
  { day: "Wed", revenue: 28000 },
  { day: "Thu", revenue: 55000 },
  { day: "Fri", revenue: 47000 },
  { day: "Sat", revenue: 62000 },
  { day: "Sun", revenue: 39000 },
];

const demandData = [
  { product: "Milk", unitsSold: 320 },
  { product: "Rice 50kg", unitsSold: 85 },
  { product: "Cooking Oil", unitsSold: 140 },
  { product: "Sugar", unitsSold: 210 },
  { product: "Flour", unitsSold: 95 },
];

const stockData = [
  { name: "In Stock", value: 38 },
  { name: "Low Stock", value: 5 },
  { name: "Out of Stock", value: 5 },
];

const STOCK_COLORS = ["#f77f00", "#fcbf49", "#d62828"];

const lowStockItems = [
  { name: "Rice 50kg", quantity: 3 },
  { name: "Cooking Oil 5L", quantity: 5 },
  { name: "Flour 2kg", quantity: 2 },
];

const recentOrders = [
  { id: 1, customer: "Mary Wanjiru", items: 3, total: "Ksh 4,200", status: "Pending" },
  { id: 2, customer: "John Otieno", items: 1, total: "Ksh 1,200", status: "Approved" },
  { id: 3, customer: "Grace Achieng", items: 5, total: "Ksh 8,900", status: "Dispatched" },
  { id: 4, customer: "Peter Kamau", items: 2, total: "Ksh 2,600", status: "Completed" },
];

function WholesalerDashboard() {
  return (
    <DashboardLayout navItems={wholesalerNavItems}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#003049]">Overview</h1>
        <div className="flex gap-2">
          <Link
            to="/dashboard/wholesaler/products"
            className="flex items-center gap-2 bg-[#f77f00] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d62828] transition-colors"
          >
            <Plus size={16} />
            Add Product
          </Link>
          <Link
            to="/dashboard/wholesaler/orders"
            className="flex items-center gap-2 bg-white border border-gray-300 text-[#003049] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} />
            View All Orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-[#003049] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-4 text-[#003049]">Revenue Trend (This Week)</h2>
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
          <h2 className="font-semibold mb-4 text-[#003049]">Product Demand (Units Sold)</h2>
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
          <h2 className="font-semibold mb-4 text-[#003049]">Stock Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stockData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {stockData.map((entry, index) => (
                  <Cell key={entry.name} fill={STOCK_COLORS[index % STOCK_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4 text-[#003049] flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#d62828]" />
            Low Stock Alerts
          </h2>
          <ul>
            {lowStockItems.map((item) => (
              <li key={item.name} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="text-sm font-semibold text-[#d62828]">{item.quantity} left</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4 text-[#003049]">Recent Orders</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Customer</th>
                <th className="pb-2">Items</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b last:border-b-0">
                  <td className="py-2">{order.customer}</td>
                  <td className="py-2">{order.items}</td>
                  <td className="py-2">{order.total}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default WholesalerDashboard;
import { ShoppingBag, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { customerNavItems } from "../../config/customerNav";
import { statusColors } from "../../config/orderStatusColors";

const stats = [
  { label: "Total Orders", value: 14 },
  { label: "Pending Orders", value: 2 },
  { label: "Completed Orders", value: 11 },
  { label: "Total Spent (Ksh)", value: "86,400" },
];

const recentOrders = [
  { id: 1, items: 3, total: "Ksh 4,200", status: "Pending", date: "2026-07-13" },
  { id: 2, items: 1, total: "Ksh 1,200", status: "Dispatched", date: "2026-07-12" },
  { id: 3, items: 5, total: "Ksh 8,900", status: "Completed", date: "2026-07-10" },
];

function CustomerDashboard() {
  return (
    <DashboardLayout navItems={customerNavItems}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#003049]">Overview</h1>
        <Link
          to="/dashboard/customer/browse"
          className="flex items-center gap-2 bg-[#f77f00] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d62828] transition-colors"
        >
          <ShoppingBag size={16} />
          Browse Products
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-[#003049] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-[#003049]">Recent Orders</h2>
          <Link
            to="/dashboard/customer/orders"
            className="text-sm text-[#f77f00] font-medium hover:underline flex items-center gap-1"
          >
            <Eye size={14} />
            View All
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Order ID</th>
              <th className="pb-2">Items</th>
              <th className="pb-2">Total</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b last:border-b-0">
                <td className="py-2">#{order.id}</td>
                <td className="py-2">{order.items}</td>
                <td className="py-2">{order.total}</td>
                <td className="py-2 text-gray-500">{order.date}</td>
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
    </DashboardLayout>
  );
}

export default CustomerDashboard;

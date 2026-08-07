import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { retailerNavItems } from "../../config/retailerNav";
import { statusColors } from "../../config/orderStatusColors";
import { Link } from "react-router-dom";

const allOrders = [
  { id: 1, items: 3, total: "Ksh 4,200", status: "Pending", date: "2026-07-13" },
  { id: 2, items: 1, total: "Ksh 1,200", status: "Dispatched", date: "2026-07-12" },
  { id: 3, items: 5, total: "Ksh 8,900", status: "Completed", date: "2026-07-10" },
  { id: 4, items: 2, total: "Ksh 2,600", status: "Completed", date: "2026-07-08" },
  { id: 5, items: 4, total: "Ksh 6,100", status: "Cancelled", date: "2026-07-05" },
];

const statusOptions = ["All", "Pending", "Approved", "Dispatched", "Completed", "Cancelled"];

function RetailerOrders() {
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = allOrders.filter(
    (order) => statusFilter === "All" || order.status === statusFilter
  );

  return (
    <DashboardLayout navItems={retailerNavItems}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#003049]">My Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b bg-gray-50">
              <th className="p-3">Order ID</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">
                  No orders match this filter.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className="border-b last:border-b-0">
                  <td className="p-3 font-medium text-[#003049]">#{order.id}</td>
                  <td className="p-3">{order.items}</td>
                  <td className="p-3">{order.total}</td>
                  <td className="p-3 text-gray-500">{order.date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3">
  <Link
    to={`/dashboard/retailer/orders/${order.id}`}
    className="inline-flex items-center rounded-lg bg-[#003049] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#00253b]"
  >
    View Details
  </Link>
</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default RetailerOrders;
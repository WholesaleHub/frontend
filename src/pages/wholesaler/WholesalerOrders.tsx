import { useState } from "react";
import { Search } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";
import { statusColors } from "../../config/orderStatusColors";

const allOrders = [
  { id: 1, customer: "Mary Wanjiru", items: 3, total: "Ksh 4,200", status: "Pending", date: "2026-07-13" },
  { id: 2, customer: "John Otieno", items: 1, total: "Ksh 1,200", status: "Approved", date: "2026-07-13" },
  { id: 3, customer: "Grace Achieng", items: 5, total: "Ksh 8,900", status: "Dispatched", date: "2026-07-12" },
  { id: 4, customer: "Peter Kamau", items: 2, total: "Ksh 2,600", status: "Completed", date: "2026-07-12" },
  { id: 5, customer: "Susan Njeri", items: 4, total: "Ksh 6,100", status: "Completed", date: "2026-07-11" },
  { id: 6, customer: "David Mwangi", items: 2, total: "Ksh 3,300", status: "Cancelled", date: "2026-07-11" },
];

const statusOptions = ["All", "Pending", "Approved", "Dispatched", "Completed", "Cancelled"];

function WholesalerOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = allOrders.filter((order) => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout navItems={wholesalerNavItems}>
      <h1 className="text-2xl font-bold text-[#003049] mb-6">Orders</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
          />
        </div>

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
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">
                  No orders match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className="border-b last:border-b-0">
                  <td className="p-3 font-medium text-[#003049]">{order.customer}</td>
                  <td className="p-3">{order.items}</td>
                  <td className="p-3">{order.total}</td>
                  <td className="p-3 text-gray-500">{order.date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
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

export default WholesalerOrders;

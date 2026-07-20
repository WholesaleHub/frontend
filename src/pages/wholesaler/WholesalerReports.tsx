import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";

const revenueByRange: Record<string, { label: string; revenue: number }[]> = {
  Today: [
    { label: "9am", revenue: 4200 },
    { label: "12pm", revenue: 9800 },
    { label: "3pm", revenue: 7100 },
    { label: "6pm", revenue: 12400 },
  ],
  "This Week": [
    { label: "Mon", revenue: 32000 },
    { label: "Tue", revenue: 41000 },
    { label: "Wed", revenue: 28000 },
    { label: "Thu", revenue: 55000 },
    { label: "Fri", revenue: 47000 },
    { label: "Sat", revenue: 62000 },
    { label: "Sun", revenue: 39000 },
  ],
  "This Month": [
    { label: "Week 1", revenue: 210000 },
    { label: "Week 2", revenue: 245000 },
    { label: "Week 3", revenue: 198000 },
    { label: "Week 4", revenue: 267000 },
  ],
};

const topCustomers = [
  { name: "Grace Achieng", orders: 24, totalSpent: "Ksh 142,000" },
  { name: "Mary Wanjiru", orders: 19, totalSpent: "Ksh 98,500" },
  { name: "Susan Njeri", orders: 15, totalSpent: "Ksh 76,200" },
  { name: "Peter Kamau", orders: 12, totalSpent: "Ksh 54,900" },
];

const topProducts = [
  { name: "Milk", unitsSold: 1240 },
  { name: "Sugar", unitsSold: 890 },
  { name: "Cooking Oil 5L", unitsSold: 610 },
  { name: "Rice 50kg", unitsSold: 320 },
];

function WholesalerReports() {
  const [range, setRange] = useState("This Week");

  return (
    <DashboardLayout navItems={wholesalerNavItems}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#003049]">Reports</h1>
        <div className="flex gap-2">
          {Object.keys(revenueByRange).map((option) => (
            <button
              key={option}
              onClick={() => setRange(option)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                range === option
                  ? "bg-[#f77f00] text-white"
                  : "bg-white border border-gray-300 text-[#003049] hover:bg-gray-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-4 text-[#003049]">Revenue — {range}</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={revenueByRange[range]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#f77f00" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4 text-[#003049]">Top Selling Products</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="unitsSold" fill="#f77f00" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4 text-[#003049]">Top Customers</h2>
          <ul>
            {topCustomers.map((customer, index) => (
              <li key={customer.name} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#003049] text-white text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#003049]">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.orders} orders</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#f77f00]">{customer.totalSpent}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default WholesalerReports;

import { useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";

type MockProduct = {
  id: number;
  name: string;
  price: string;
  quantity: number;
  status: string;
};

const initialProducts: MockProduct[] = [
  { id: 1, name: "Milk", price: "Ksh 30", quantity: 100, status: "In Stock" },
  { id: 2, name: "Rice 50kg", price: "Ksh 4,500", quantity: 3, status: "Low Stock" },
  { id: 3, name: "Cooking Oil 5L", price: "Ksh 1,200", quantity: 5, status: "Low Stock" },
  { id: 4, name: "Sugar", price: "Ksh 200", quantity: 0, status: "Out of Stock" },
  { id: 5, name: "Flour 2kg", price: "Ksh 180", quantity: 60, status: "In Stock" },
];

const statusStyles: Record<string, string> = {
  "In Stock": "bg-green-100 text-green-700",
  "Low Stock": "bg-yellow-100 text-yellow-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

function WholesalerProducts() {
  const [products] = useState<MockProduct[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout navItems={wholesalerNavItems}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#003049]">Products</h1>
        <button className="flex items-center gap-2 bg-[#f77f00] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d62828] transition-colors">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b bg-gray-50">
              <th className="p-3">Product Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b last:border-b-0">
                <td className="p-3 font-medium text-[#003049]">{product.name}</td>
                <td className="p-3">{product.price}</td>
                <td className="p-3">{product.quantity}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[product.status]}`}>
                    {product.status}
                  </span>
                </td>
                <td className="p-3">
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default WholesalerProducts;
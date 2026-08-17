import { useEffect, useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { retailerNavItems } from "../../config/retailerNav";

import { getProducts } from "../../services/productService";
import type { Product } from "../../services/productService";
import { useAuth } from "../../context/AuthContext";

function RetailerBrowse() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  if (!token) return;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProducts(token, {
        page: 1,
        limit: 100,
      });

      setProducts(response.data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load products.");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, [token]);

  const filteredProducts = products.filter((product) =>
  product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
);

  return (
    <DashboardLayout navItems={retailerNavItems}>
      <h1 className="text-2xl font-bold text-[#003049] mb-6">
        Browse Products
      </h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6 max-w-sm">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>


      {loading ? (
        <p className="text-center text-gray-500 py-10">
          Loading products...
        </p>
      ) : error ? (
        <p className="text-center text-red-500 py-10">
          {error}
        </p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          No products available.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const outOfStock = product.stock_quantity <= 0;

            return (
              <div
                key={product.product_id}
                className="bg-white rounded-lg shadow p-4">
              
                <div className="bg-gray-50 rounded-lg h-40 flex items-center justify-center mb-3">
                   <ShoppingCart size={40} className="text-gray-300" />
                </div>

                <h2 className="font-semibold text-[#003049]">
                  {product.product_name}
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                   SKU: {product.sku}
                </p>

                <p className="text-gray-500 text-sm mt-1">
                  {product.category?.category_name ?? "Uncategorized"}
                </p>

                <p className="text-[#f77f00] font-semibold mt-2">
                  Ksh {Number(product.unit_price).toLocaleString()}
                </p>

                <p
                  className={`text-sm mt-1 ${
                    outOfStock
                      ? "text-red-500 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {outOfStock
  ? "Out of Stock"
  : `${product.stock_quantity} available`}
                </p>

                <button
                  disabled={outOfStock}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-[#f77f00] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#d62828] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={16} />
                  Order
                </button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export default RetailerBrowse;
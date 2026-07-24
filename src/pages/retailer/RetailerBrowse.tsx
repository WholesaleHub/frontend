import { useEffect, useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { retailerNavItems } from "../../config/retailerNav";
<<<<<<< HEAD
import { Link } from "react-router-dom";

const availableProducts = [
  { id: 1, name: "Milk", price: "Ksh 30", quantity: 100 },
  { id: 2, name: "Rice 50kg", price: "Ksh 4,500", quantity: 3 },
  { id: 3, name: "Cooking Oil 5L", price: "Ksh 1,200", quantity: 5 },
  { id: 4, name: "Sugar", price: "Ksh 200", quantity: 0 },
  { id: 5, name: "Flour 2kg", price: "Ksh 180", quantity: 60 },
];
=======
import { getProducts } from "../../services/productService";
import type { Product } from "../../services/productService";
>>>>>>> c048ca97da5559f1cfc24892fdfb7340bdfbb395

function RetailerBrowse() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();

        setProducts(data);
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
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
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

<<<<<<< HEAD
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => {
          const outOfStock = product.quantity <= 0;
          return (
            <div key={product.id} className="bg-white rounded-lg shadow p-4">
              <Link to={`/products/${product.id}`} className="hover:underline">
                <h2 className="font-semibold text-[#003049]">{product.name}</h2>
              </Link>
              <p className="text-[#f77f00] font-semibold mt-1">{product.price}</p>
              <p className={`text-sm mt-1 ${outOfStock ? "text-red-500 font-medium" : "text-gray-500"}`}>
                {outOfStock ? "Out of stock" : `${product.quantity} available`}
              </p>
              <button
                disabled={outOfStock}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-[#f77f00] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#d62828] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
=======
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
            const outOfStock = product.stock <= 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow p-4"
>>>>>>> c048ca97da5559f1cfc24892fdfb7340bdfbb395
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}

                <h2 className="font-semibold text-[#003049]">
                  {product.name}
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  {product.description}
                </p>

                <p className="text-[#f77f00] font-semibold mt-2">
                  Ksh {product.price.toLocaleString()}
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
                    : `${product.stock} available`}
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
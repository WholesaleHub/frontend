import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Package, ShoppingCart } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { retailerNavItems } from "../../config/retailerNav";
import { useAuth } from "../../context/AuthContext";
import { getProducts, type Product, type Category } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useCart } from "../../context/CartContext";
import ErrorState from "../../components/ui/ErrorState";
import ProductImage from "../../components/ui/ProductImage";
import StockBadge from "../../components/ui/StockBadge";

const PAGE_SIZE = 9;



export default function ProductListingPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadAll() {
  if (!token) return;
  setIsLoading(true);
  setError("");
  try {
  const productsResponse = await getProducts(token, {
    page,
    limit: PAGE_SIZE,
    search: searchTerm || undefined,
    category:
      categoryFilter !== "all"
        ? Number(categoryFilter)
        : undefined,
    availability:
      statusFilter !== "all"
        ? statusFilter
        : undefined,
  });

  setProducts(productsResponse.data);
  setTotalPages(productsResponse.meta.totalPages);

  try {
    const categoriesData = await getCategories(token);
    setCategories(categoriesData);
  } catch (categoryError) {
    console.error(
      "Failed to load categories:",
      categoryError
    );

    setCategories([]);
  }
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Failed to load products."
  );

  setProducts([]);
  setTotalPages(1);
} 
  finally {
    setIsLoading(false);
  }
}

  useEffect(() => {
  loadAll();
}, [token, page, searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  

  return (
    <DashboardLayout navItems={retailerNavItems}>
      <h1 className="text-2xl font-bold text-[#003049] mb-6">Browse Products</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
          ))}
        </select>
        <select
  value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
  className="border rounded-lg px-3 py-2 text-sm bg-white"
>
  <option value="all">All Status</option>
  <option value="IN_STOCK">In Stock</option>
  <option value="LOW_STOCK">Low Stock</option>
  <option value="OUT_OF_STOCK">Out of Stock</option>
</select>
      </div>

      {error && !isLoading && <ErrorState message={error} onRetry={loadAll} />}

      {!error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
            ) : products.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow p-10 text-center text-gray-400">
                <Package size={40} className="mx-auto mb-3 text-gray-300" />
                No products match your search.
              </div>
            ) : (
             products.map((product) => {
  return (
    <div
      key={product.product_id}
      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
    >
      <Link to={`/products/${product.product_id}`}>
        <ProductImage
          imageUrl={product.image_url}
          alt={product.product_name}
          className="w-full h-36 rounded-lg mb-3"
          iconSize={40}
        />

        <h2 className="font-semibold text-[#003049]">
          {product.product_name}
        </h2>

        <p className="text-[#f77f00] font-semibold mb-2">
          Ksh {Number(product.unit_price).toLocaleString()}
        </p>

        <StockBadge
          stockStatus={product.stock_status}
          stockQuantity={product.stock_quantity}
        />
      </Link>

      <button
        type="button"
        onClick={() =>
          addToCart({
            product_id: String(product.product_id),
            product_name: product.product_name,
            unit_price: Number(product.unit_price),
            image_url: product.image_url || undefined,
            stock_quantity: product.stock_quantity,
          })
        }
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-[#f77f00] py-2 text-white hover:bg-[#d62828]"
      >
        <ShoppingCart size={18} />
        Add to Cart
      </button>
    </div>
  );
})
            )}
          </div>

          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
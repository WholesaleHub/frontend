import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Package } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { retailerNavItems } from "../../config/retailerNav";
import { useAuth } from "../../context/AuthContext";
import { getProducts, type Product, type Category } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { SkeletonCard } from "../../components/ui/Skeleton";
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
              products.map((product) => (
                <Link
                  key={product.product_id}
                  to={`/products/${product.product_id}`}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                >
                  <ProductImage
                     imageUrl={product.image_url}
                       alt={product.product_name}
                       className="w-full h-36 rounded-lg mb-3 pointer-events-none"
                     iconSize={40}
                    />
                  {product.category && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full mb-2">
                      {product.category.category_name}
                    </span>
                  )}
                  <h2 className="font-semibold text-[#003049] mb-1">{product.product_name}</h2>
                  <p className="text-[#f77f00] font-semibold mb-2">
                    Ksh {Number(product.unit_price).toLocaleString()}
                  </p>
                  <StockBadge
  stockStatus={product.stock_status}
  stockQuantity={product.stock_quantity}
/>
                </Link>
              ))
            )}
          </div>

          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed"
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
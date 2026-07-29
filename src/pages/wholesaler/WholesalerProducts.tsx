import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, Search, Eye, Pencil } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";
import { useAuth } from "../../context/AuthContext";
import { getProducts, deleteProduct, type Product, type Category, type StockStatus } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { SkeletonTableRow } from "../../components/ui/Skeleton";
import ErrorModal from "../../components/ui/ErrorModal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ProductImage from "../../components/ui/ProductImage";
import StockBadge from "../../components/ui/StockBadge";



export default function WholesalerProducts() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | StockStatus>("all");

  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [pendingEdit, setPendingEdit] = useState<Product | null>(null);

  const loadAll = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
  const productsResponse = await getProducts(token, {
    limit: 100,
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
}
    finally {
      setIsLoading(false);
    }
  }, [ token,
  searchTerm,
  categoryFilter,
  statusFilter,]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function confirmDelete() {
    if (!token || !pendingDelete) return;
    try {
      await deleteProduct(token, pendingDelete.product_id);
      setPendingDelete(null);
      await loadAll();
    } catch (err) {
      setPendingDelete(null);
      setError(err instanceof Error ? err.message : "Failed to delete product.");
    }
  }

  function confirmEdit() {
    if (!pendingEdit) return;
    navigate(`/dashboard/wholesaler/products/${pendingEdit.product_id}/edit`);
    setPendingEdit(null);
  }

  

  if (error && !isLoading) {
    return (
      <DashboardLayout navItems={wholesalerNavItems}>
        <ErrorModal message={error} homePath="/dashboard/wholesaler" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={wholesalerNavItems}>
      <div className="flex justify-between items-center mb-1">
        <div>
          <h1 className="text-2xl font-bold text-[#003049]">Products</h1>
          <p className="text-sm text-gray-500">Manage and view all products in your store.</p>
        </div>
        <Link
          to="/dashboard/wholesaler/products/new"
          className="flex items-center gap-2 bg-[#f77f00] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d62828] transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4 my-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search products..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <select
          value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
          ))}
        </select>
        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | StockStatus)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Status</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b bg-gray-50">
              <th className="p-3">Product</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price (Ksh)</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} columns={7} />)
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center text-gray-400">No products found.</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product.product_id} className="border-b last:border-b-0">
                  <td className="p-3">
  <Link
    to={`/products/${product.product_id}`}
    className="inline-flex items-center gap-3 group"
  >
    <ProductImage
      imageUrl={product.image_url}
      alt={product.product_name}
      className="w-10 h-10 rounded-lg"
      iconSize={18}
    />

    <span className="font-medium text-[#003049] group-hover:text-[#f77f00] group-hover:underline">
      {product.product_name}
    </span>
  </Link>
</td>
                  <td className="p-3 text-gray-500">{product.sku}</td>
                  <td className="p-3">{product.category?.category_name ?? "—"}</td>
                  <td className="p-3">{Number(product.unit_price).toLocaleString()}</td>
                  <td className="p-3">{product.stock_quantity}</td>
                  <td className="p-3">
                    <StockBadge
  stockStatus={product.stock_status}
  stockQuantity={product.stock_quantity}
/>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 text-gray-500">
                      <Link to={`/products/${product.product_id}`} title="View" className="hover:text-[#003049]">
                        <Eye size={16} />
                      </Link>
                      <button title="Edit" onClick={() => setPendingEdit(product)} className="hover:text-[#f77f00]">
                        <Pencil size={16} />
                      </button>
                      <button title="Delete" onClick={() => setPendingDelete(product)} className="hover:text-[#d62828]">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!pendingEdit}
        title="Edit Product"
        message={`Do you want to edit "${pendingEdit?.product_name}"?`}
        confirmLabel="Edit"
        onConfirm={confirmEdit}
        onCancel={() => setPendingEdit(null)}
      />
      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${pendingDelete?.product_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </DashboardLayout>
  );
}
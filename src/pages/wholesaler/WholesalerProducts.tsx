import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Search } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";
import { useAuth } from "../../context/AuthContext";
import { getProducts, createProduct, deleteProduct, type Product } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import type { Category } from "../../services/productService";
import { SkeletonTableRow } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";

const STOCK_STYLES: Record<string, string> = {
  IN_STOCK: "bg-green-100 text-green-700",
  LOW_STOCK: "bg-yellow-100 text-yellow-700",
  OUT_OF_STOCK: "bg-red-100 text-red-700",
};

export default function WholesalerProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadAll() {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(token),
        getCategories(token),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, [token]);

  async function handleAddProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    setFormError("");
    setIsSubmitting(true);
    try {
      await createProduct(token, {
        product_name: newName,
        sku: newSku,
        category_id: Number(newCategoryId),
        unit_price: Number(newPrice),
        stock_quantity: Number(newQuantity),
      });
      setNewName("");
      setNewSku("");
      setNewCategoryId("");
      setNewPrice("");
      setNewQuantity("");
      await loadAll();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(productId: number) {
    if (!token) return;
    try {
      await deleteProduct(token, productId);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product.");
    }
  }

  const filtered = products.filter((p) => {
    const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category_id === Number(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout navItems={wholesalerNavItems}>
      <h1 className="text-2xl font-bold text-[#003049] mb-6">Products</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3 text-[#003049]">Add New Product</h2>
        {formError && <p className="bg-red-100 text-red-700 text-sm p-2 rounded mb-3">{formError}</p>}
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Product name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            type="text"
            placeholder="SKU"
            value={newSku}
            onChange={(e) => setNewSku(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            required
          />
          <select
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
            required
          >
            <option value="">Category</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Price (Ksh)"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-[#f77f00] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d62828] transition-colors disabled:bg-gray-300"
          >
            <Plus size={16} />
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col sm:flex-row gap-3">
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
      </div>

      {error && !isLoading && <ErrorState message={error} onRetry={loadAll} />}

      {!error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} columns={7} />)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-4 text-center text-gray-400">No products found.</td></tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.product_id} className="border-b last:border-b-0">
                    <td className="p-3 font-medium text-[#003049]">
                      <Link to={`/products/${product.product_id}`} className="hover:underline">
                        {product.product_name}
                      </Link>
                    </td>
                    <td className="p-3 text-gray-500">{product.sku}</td>
                    <td className="p-3">{product.category?.category_name ?? "—"}</td>
                    <td className="p-3">Ksh {Number(product.unit_price).toLocaleString()}</td>
                    <td className="p-3">{product.stock_quantity}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STOCK_STYLES[product.stock_status]}`}>
                        {product.stock_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleDelete(product.product_id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
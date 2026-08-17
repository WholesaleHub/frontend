import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";
import { retailerNavItems } from "../../config/retailerNav";
import { useAuth } from "../../context/AuthContext";
import { getProductById, deleteProduct, type Product } from "../../services/productService";
import { Skeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ProductImage from "../../components/ui/ProductImage";
import StockBadge from "../../components/ui/StockBadge";



export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const isWholesaler = user?.role.toLowerCase() === "wholesaler";

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const navItems = isWholesaler ? wholesalerNavItems : retailerNavItems;
  const backPath = isWholesaler ? "/dashboard/wholesaler/products" : "/dashboard/retailer/browse";

  const fetchProduct = useCallback(async () => {
    if (!id || !token) return;
    setIsLoading(true);
    setError("");
    try {
      setProduct(await getProductById(id, token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product details.");
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    document.title = product ? `${product.product_name} | WholesaleHub` : "Product Details | WholesaleHub";
  }, [product]);

  async function handleDelete() {
    if (!token || !product) return;
    try {
      await deleteProduct(token, product.product_id);
      navigate(backPath);
    } catch (err) {
      setShowDeleteConfirm(false);
      setError(err instanceof Error ? err.message : "Failed to delete product.");
    }
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => navigate(backPath)} className="flex items-center gap-1 hover:text-[#003049]">
          <ArrowLeft size={16} /> Products
        </button>
        {product && (
          <>
            <span>/</span>
            <span className="text-[#003049] font-medium">{product.product_name}</span>
          </>
        )}
      </div>

      {isLoading && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-72 md:h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-1/3" />
            </div>
          </div>
        </div>
      )}

      {!isLoading && error && (
        <ErrorState title="Product Not Found" message={error} onRetry={fetchProduct} />
      )}

      {!isLoading && !error && product && (
        <div className="bg-white rounded-lg shadow p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ProductImage
                imageUrl={product.image_url}
                alt={product.product_name}
                className="w-full h-72 md:h-96 rounded-lg"
                iconSize={64}
              />
              <div className="flex gap-2 mt-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-14 h-14 rounded-lg bg-gray-100 border" />
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-bold text-[#003049]">{product.product_name}</h1>
                <StockBadge
  stockStatus={product.stock_status}
  stockQuantity={product.stock_quantity}
  className="px-3"
/>
              </div>
              {product.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {product.description}
                </p>
                )}

              <dl className="text-sm mt-4 space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">SKU</dt>
                  <dd className="font-medium text-[#003049]">{product.sku}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">Category</dt>
                  <dd className="font-medium text-[#003049]">{product.category?.category_name ?? "—"}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">Price</dt>
                  <dd className="font-semibold text-[#f77f00]">Ksh {Number(product.unit_price).toLocaleString()}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">Stock Quantity</dt>
                  <dd className="font-medium text-[#003049]">{product.stock_quantity}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">Status</dt>
                  <dd className="font-medium text-[#003049]">{product.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Added On</dt>
                  <dd className="font-medium text-[#003049]">
                    {new Date(product.created_at).toLocaleString()}
                  </dd>
                </div>
              </dl>

              {isWholesaler && (
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setShowEditConfirm(true)}
                    className="flex items-center gap-2 border border-gray-300 text-[#003049] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <Pencil size={16} /> Edit Product
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 border border-red-300 text-[#d62828] px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50"
                  >
                    <Trash2 size={16} /> Delete Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showEditConfirm}
        title="Edit Product"
        message={`Do you want to edit "${product?.product_name}"?`}
        confirmLabel="Edit"
        onConfirm={() => {
          setShowEditConfirm(false);
          navigate(`/dashboard/wholesaler/products/${product?.product_id}/edit`);
        }}
        onCancel={() => setShowEditConfirm(false)}
      />
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${product?.product_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </DashboardLayout>
  );
}
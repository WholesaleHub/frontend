import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";
import { retailerNavItems } from "../../config/retailerNav";
import { useAuth } from "../../context/AuthContext";
import { getProductById, type Product } from "../../services/productService";
import { Skeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";

const STOCK_STYLES: Record<string, string> = {
  IN_STOCK: "bg-green-100 text-green-700",
  LOW_STOCK: "bg-yellow-100 text-yellow-700",
  OUT_OF_STOCK: "bg-red-100 text-red-700",
};

const STOCK_LABELS: Record<string, string> = {
  IN_STOCK: "In stock",
  LOW_STOCK: "Low stock",
  OUT_OF_STOCK: "Out of stock",
};

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const navItems = user?.role.toLowerCase() === "wholesaler" ? wholesalerNavItems : retailerNavItems;
  const backPath = user?.role.toLowerCase() === "wholesaler" ? "/dashboard/wholesaler/products" : "/dashboard/retailer/browse";

  useEffect(() => {
    document.title = product ? `${product.product_name} | WholesaleHub` : "Product Details | WholesaleHub";
  }, [product]);

  useEffect(() => {
    async function fetchProduct() {
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
    }
    fetchProduct();
  }, [id, token]);

  return (
    <DashboardLayout navItems={navItems}>
      <button
        onClick={() => navigate(backPath)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#003049] mb-6"
      >
        <ArrowLeft size={16} />
        Back to Products
      </button>

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
        <ErrorState title="Product Not Found" message={error} onRetry={() => window.location.reload()} />
      )}

      {!isLoading && !error && product && (
        <div className="bg-white rounded-lg shadow p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg flex items-center justify-center h-72 md:h-96">
              <Package size={64} className="text-gray-300" />
            </div>

            <div className="flex flex-col">
              {product.category && (
                <span className="inline-block w-fit bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full mb-2">
                  {product.category.category_name}
                </span>
              )}

              <h1 className="text-2xl font-bold text-[#003049] mb-1">{product.product_name}</h1>
              <p className="text-xs text-gray-400 mb-3">SKU: {product.sku}</p>

              <p className="text-2xl font-semibold text-[#f77f00] mb-4">
                Ksh {Number(product.unit_price).toLocaleString()}
              </p>

              <p className="text-gray-500 text-sm italic mb-6">
                Product description not yet available from the backend.
              </p>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STOCK_STYLES[product.stock_status]}`}>
                  {STOCK_LABELS[product.stock_status]}
                </span>
                <span className="text-sm text-gray-500">{product.stock_quantity} units available</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
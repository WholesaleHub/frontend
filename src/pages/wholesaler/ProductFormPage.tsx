import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UploadCloud, Trash2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";
import { useAuth } from "../../context/AuthContext";
import {
  createProduct, updateProduct, getProductById, resolveImageUrl, type Category,
} from "../../services/productService";
import { getCategories, createCategory } from "../../services/categoryService";

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [description, setDescription] = useState("");

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [
  removeExistingImage,
  setRemoveExistingImage,
] = useState(false);
  

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


  useEffect(() => {
    async function init() {
      if (!token) return;
      try {
        const cats = await getCategories(token);
        setCategories(cats);
        if (isEditMode && id) {
          const product = await getProductById(id, token);
          setName(product.product_name);
          setSku(product.sku);
          setCategoryId(String(product.category_id));
          setPrice(product.unit_price);
          setQuantity(String(product.stock_quantity));
          setStatus(product.status);
          setDescription(product.description ?? "");
          setImagePreview(resolveImageUrl(product.image_url));
          setRemoveExistingImage(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load form data.");
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [token, id, isEditMode]);
  useEffect(() => {
  return () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
  };
}, [imagePreview]);

  function handleImageSelect(file: File | null) {
  setError("");

  if (!file) return;

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    setError("Please select a JPG, PNG, or WebP image.");
    return;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    setError("The product image must not exceed 15 MB.");
    return;
  }

  setRemoveExistingImage(false);
  setImageFile(file);
  setImagePreview(URL.createObjectURL(file));
}

  function handleRemovePreview() {
  setImageFile(null);
  setImagePreview(null);

  if (isEditMode) {
    setRemoveExistingImage(true);
  }
}

  async function handleAddCategory() {
    if (!token || !newCategoryName.trim()) return;
    try {
      const created = await createCategory(token, { category_name: newCategoryName.trim() });
      setCategories((prev) => [...prev, created]);
      setCategoryId(String(created.category_id));
      setNewCategoryName("");
      setShowNewCategory(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    setError("");
    const trimmedName = name.trim();
    const trimmedSku = sku.trim();
    const numericCategoryId = Number(categoryId);
    const numericPrice = Number(price);
    const numericQuantity = Number(quantity);

if (!trimmedName) {
  setError("Product name is required.");
  return;
}

if (!trimmedSku) {
  setError("SKU is required.");
  return;
}

if (!categoryId || !Number.isInteger(numericCategoryId)) {
  setError("Please select a valid category.");
  return;
}

if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
  setError("Price must be greater than zero.");
  return;
}

if (
  !Number.isInteger(numericQuantity) ||
  numericQuantity < 0
) {
  setError("Stock quantity must be a whole number of zero or more.");
  return;
}
    setIsSubmitting(true);

    const fields = {
  product_name: trimmedName,
  sku: trimmedSku,
  category_id: numericCategoryId,
  unit_price: numericPrice,
  stock_quantity: numericQuantity,
  status,
  description: description.trim(),
  remove_image:
  isEditMode && removeExistingImage
    ? true
    : undefined,
};


    try {
      if (isEditMode && id) {
        await updateProduct(token, Number(id), fields, imageFile);
      } else {
        await createProduct(token, fields, imageFile);
      }
      navigate("/dashboard/wholesaler/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardLayout navItems={wholesalerNavItems}>
      <h1 className="text-2xl font-bold text-[#003049] mb-1">
        {isEditMode ? "Edit Product" : "Add New Product"}
      </h1>
      <p className="text-sm text-gray-500 mb-6">Fill in the product details below</p>

      {error && <p className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price (Ksh)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <div className="flex gap-2">
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white" required>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setShowNewCategory((s) => !s)} className="px-3 border rounded-lg text-sm text-[#f77f00] border-[#f77f00]">
                  +
                </button>
              </div>
              {showNewCategory && (
                <div className="flex gap-2 mt-2">
                  <input type="text" placeholder="New category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                  <button type="button" onClick={handleAddCategory} className="bg-[#003049] text-white px-3 rounded-lg text-sm">Add</button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity</label>
              <input
  type="number"
  value={quantity}
  onChange={(e) => setQuantity(e.target.value)}
  min="0"
  step="1"
  className="w-full border rounded-lg px-3 py-2 text-sm"
  required
/>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                rows={4} maxLength={1000}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="High quality maize flour suitable for ugali and other meals."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Product Image</label>
            <label className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-gray-50">
              <UploadCloud size={28} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Drag and drop an image here, or</span>
              <span className="text-sm text-[#f77f00] font-medium mt-1">Choose File</span>
              <input
  type="file"
  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
  className="hidden"
  onChange={(e) =>
    handleImageSelect(e.target.files?.[0] ?? null)
  }
/>
            </label>
            {imagePreview && (
              <div className="relative mt-3 w-24 h-24">
                <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
                <button
  type="button"
  onClick={handleRemovePreview}
  className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 text-red-600"
  aria-label="Remove selected image"
>
  <Trash2 size={14} />
</button>
              </div>
            )}
          </div>

          <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#f77f00] text-white hover:bg-[#d62828] disabled:bg-gray-300">
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
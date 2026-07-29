import { extractErrorMessage } from "../utils/apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN;

export type Category = {
  category_id: number;
  category_name: string;
  description?: string;
};

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type Product = {
  product_id: number;
  product_name: string;
  sku: string;
  category_id: number;
  unit_price: string;
  stock_quantity: number;
  image_url: string | null;
  description: string | null;
  status: string;
  created_at: string;
  category?: Category;
  stock_status?: StockStatus;
};

export type ProductListMeta = { total: number; page: number; limit: number; totalPages: number };
export type ProductListResponse = { data: Product[]; meta: ProductListMeta };

export type ProductQueryParams = {
  search?: string;
  category?: number;
  availability?: string;
  page?: number;
  limit?: number;
};

export type ProductFormFields = {
  product_name: string;
  sku: string;
  category_id: number;
  unit_price: number;
  stock_quantity: number;
  status?: string;
  description?: string;
  remove_image?: boolean;
};

export function resolveImageUrl(
  imageUrl: string | null | undefined
): string | null {
  if (!imageUrl?.trim()) return null;

  const trimmedImageUrl = imageUrl.trim();

  if (
    trimmedImageUrl.startsWith("http://") ||
    trimmedImageUrl.startsWith("https://") ||
    trimmedImageUrl.startsWith("blob:") ||
    trimmedImageUrl.startsWith("data:")
  ) {
    return trimmedImageUrl;
  }

  if (!BACKEND_ORIGIN) {
    console.error(
      "VITE_BACKEND_ORIGIN is not configured. Cannot resolve product image:",
      trimmedImageUrl
    );
    return null;
  }

  const origin = BACKEND_ORIGIN.replace(/\/+$/, "");
  const path = trimmedImageUrl.startsWith("/")
    ? trimmedImageUrl
    : `/${trimmedImageUrl}`;

  return `${origin}${path}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 404) throw new Error("Product not found.");
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Something went wrong. Please try again."));
  }
  return response.json();
}

export async function getProducts(token: string, params?: ProductQueryParams): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", String(params.category));
  if (params?.availability) query.set("availability", params.availability);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  const response = await fetch(`${API_BASE_URL}/products${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await handleResponse<unknown>(response);

  if (result && typeof result === "object" && Array.isArray((result as ProductListResponse).data)) {
    return result as ProductListResponse;
  }
  if (Array.isArray(result)) {
    return { data: result as Product[], meta: { total: result.length, page: 1, limit: result.length, totalPages: 1 } };
  }
  console.error("Unexpected response shape from GET /products:", result);
  throw new Error("Unexpected response format from the server. Please contact the backend team.");
}

export async function getProductById(id: string | number, token: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<Product>(response);
}

function buildFormData(fields: Partial<ProductFormFields>, imageFile?: File | null): FormData {
  const form = new FormData();
  if (fields.product_name !== undefined) form.append("product_name", fields.product_name);
  if (fields.sku !== undefined) form.append("sku", fields.sku);
  if (fields.category_id !== undefined) form.append("category_id", String(fields.category_id));
  if (fields.unit_price !== undefined) form.append("unit_price", String(fields.unit_price));
  if (fields.stock_quantity !== undefined) form.append("stock_quantity", String(fields.stock_quantity));
  if (fields.status !== undefined) form.append("status", fields.status);
  if (fields.description !== undefined) form.append("description", fields.description);
  if (fields.remove_image !== undefined) {
  form.append(
    "remove_image",
    String(fields.remove_image)
  );
}
  if (imageFile) form.append("image", imageFile);
  return form;
}

export async function createProduct(
  token: string,
  fields: ProductFormFields,
  imageFile?: File | null
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: buildFormData(fields, imageFile),
  });
  return handleResponse<Product>(response);
}

export async function updateProduct(
  token: string,
  productId: number,
  fields: Partial<ProductFormFields>,
  imageFile?: File | null
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: buildFormData(fields, imageFile),
  });
  return handleResponse<Product>(response);
}

export async function deleteProduct(token: string, productId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to delete product."));
  }
}
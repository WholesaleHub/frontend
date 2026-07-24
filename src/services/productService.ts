const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  unit_price: string; // Prisma Decimal serializes as a string over JSON
  stock_quantity: number;
  status: string;
  created_at: string;
  category?: Category;
  stock_status: StockStatus;
};

export type CreateProductPayload = {
  product_name: string;
  sku: string;
  category_id: number;
  unit_price: number;
  stock_quantity: number;
  status?: string;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 404) {
    throw new Error("Product not found.");
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Something went wrong. Please try again.");
  }
  return response.json();
}

export async function getProducts(token: string): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<Product[]>(response);
}

export async function getProductById(id: string | number, token: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<Product>(response);
}

export async function createProduct(token: string, product: CreateProductPayload): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(product),
  });
  return handleResponse<Product>(response);
}

export async function deleteProduct(token: string, productId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to delete product.");
  }
}
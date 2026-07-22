const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || "Something went wrong while processing your request."
    );
  }

  return response.json();
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`);

  return handleResponse<Product[]>(response);
}

export async function createProduct(
  token: string,
  product: Omit<Product, "id">
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });

  return handleResponse<Product>(response);
}

export async function deleteProduct(
  token: string,
  productId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || "Failed to delete product."
    );
  }
}
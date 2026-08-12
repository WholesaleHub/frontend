import { extractErrorMessage } from "../utils/apiError";
import type { Product } from "./productService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type OrderItem = {
  order_item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
  product?: Product;
};

export type Order = {
  order_id: number;
  customer_id: number;
  created_by_user_id: string;
  order_date: string;
  status: string;
  total_amount: string;
  created_at: string;
  orderItems: OrderItem[];
  customer?: {
    customer_id: number;
    business_name?: string;
    business_location?: string;
    contact_person?: string;
    phone?: string;
    latitude?: number | string | null;
    longitude?: number | string | null;
    delivery_notes?: string | null;
  };
};

export type CreateOrderItemPayload = { product_id: number; quantity: number };
export type CreateOrderPayload = {
  items: CreateOrderItemPayload[];
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 404) {
    throw new Error("Order not found.");
  }

  if (response.status === 403) {
    throw new Error("You don't have permission to view this order.");
  }

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
        "Something went wrong. Please try again.",
      ),
    );
  }

  return response.json();
}

export async function createOrder(
  token: string,
  payload: CreateOrderPayload,
): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<Order>(response);
}

export async function getOrders(token: string): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await handleResponse<unknown>(response);
  if (Array.isArray(result)) return result as Order[];
  if (
    result &&
    typeof result === "object" &&
    Array.isArray((result as { data: unknown }).data)
  ) {
    return (result as { data: Order[] }).data;
  }
  console.error("Unexpected response shape from GET /orders:", result);
  return [];
}

export async function getOrderById(
  id: string | number,
  token: string,
): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<Order>(response);
}

export async function updateOrderStatus(
  token: string,
  id: number,
  status: string,
): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return handleResponse<Order>(response);
}

import { extractErrorMessage } from "../utils/apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type Order = {
  order_id: number;
  status: string;
  total_amount: number;
  created_at: string;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "Failed to load orders.")
    );
  }

  return response.json();
}

export async function getOrders(token: string): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<Order[]>(response);
}
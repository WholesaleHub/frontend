import { extractErrorMessage } from "../utils/apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type CustomerStatus = "ACTIVE" | "SUSPENDED";

export type CustomerProfile = {
  customer_id: number;
  user_id: string;
  business_name: string;
  business_location: string;
  contact_person: string;
  phone: string;
  status: CustomerStatus;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    status: string;
  };
};

export type CustomerProfilePayload = {
  business_name: string;
  business_location: string;
  contact_person: string;
  phone: string;
};

async function handleResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, fallbackMessage));
  }

  return response.json();
}

export async function getMyCustomerProfile(
  token: string,
): Promise<CustomerProfile | null> {
  const response = await fetch(`${API_BASE_URL}/customers/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  return handleResponse<CustomerProfile>(
    response,
    "Failed to load your business profile.",
  );
}

export async function updateMyCustomerProfile(
  token: string,
  payload: CustomerProfilePayload,
): Promise<CustomerProfile> {
  const response = await fetch(`${API_BASE_URL}/customers/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<CustomerProfile>(
    response,
    "Failed to update your business profile.",
  );
}
export type CustomerPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CustomersResponse = {
  data: CustomerProfile[];
  pagination: CustomerPagination;
};

export type CustomerQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus | "";
};

export async function getCustomers(
  token: string,
  query: CustomerQuery = {},
): Promise<CustomersResponse> {
  const parameters = new URLSearchParams();

  parameters.set("page", String(query.page ?? 1));
  parameters.set("limit", String(query.limit ?? 10));

  if (query.search?.trim()) {
    parameters.set("search", query.search.trim());
  }

  if (query.status) {
    parameters.set("status", query.status);
  }

  const response = await fetch(
    `${API_BASE_URL}/customers?${parameters.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return handleResponse<CustomersResponse>(
    response,
    "Failed to load customers.",
  );
}

export async function changeCustomerStatus(
  token: string,
  customerId: number,
  status: CustomerStatus,
): Promise<CustomerProfile> {
  const response = await fetch(
    `${API_BASE_URL}/customers/${customerId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    },
  );

  return handleResponse<CustomerProfile>(
    response,
    "Failed to update customer status.",
  );
}

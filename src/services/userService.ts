import { extractErrorMessage } from "../utils/apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type UserRole = "ADMIN" | "WHOLESALER" | "RETAILER";
export type UserStatus = "ACTIVE" | "INACTIVE";

export type AdminUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
};

export type UserFilters = {
  search?: string;
  role?: UserRole | "";
  status?: UserStatus | "";
};

async function handleResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, fallback));
  }

  return response.json();
}

export async function getUsers(
  token: string,
  filters: UserFilters = {},
): Promise<AdminUser[]> {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.role) {
    params.set("role", filters.role);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/users${query ? `?${query}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return handleResponse<AdminUser[]>(response, "Failed to load users.");
}

export async function updateUserStatus(
  token: string,
  userId: string,
  status: UserStatus,
): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  return handleResponse<AdminUser>(response, "Failed to update user status.");
}

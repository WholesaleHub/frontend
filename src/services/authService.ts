const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  message: string;
  accessToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
    status: string;
  };
};

async function handleResponse(response: Response): Promise<AuthResponse> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Something went wrong. Please try again.");
  }
  return response.json();
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

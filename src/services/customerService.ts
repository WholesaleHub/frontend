import { extractErrorMessage } from "../utils/apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type CustomerProfile = {
  customer_id: number;
  user_id: string;
  business_name: string;
  business_location: string;
  contact_person: string;
  phone: string;
  status: string;
  created_at: string;
};

export type CustomerProfilePayload = {
  business_name: string;
  business_location: string;
  contact_person: string;
  phone: string;
};

export async function getMyCustomerProfile(
  token: string
): Promise<CustomerProfile | null> {
  const response = await fetch(
    `${API_BASE_URL}/customers/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
        "Failed to load your business profile."
      )
    );
  }

  return response.json();
}

export async function saveMyCustomerProfile(
  token: string,
  payload: CustomerProfilePayload
): Promise<CustomerProfile> {
  const response = await fetch(
    `${API_BASE_URL}/customers/me`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
        "Failed to save your business profile."
      )
    );
  }

  return response.json();
}

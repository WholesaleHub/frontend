import { extractErrorMessage } from "../utils/apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function resolveCustomerImageUrl(
  imageUrl: string | null | undefined,
): string | null {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
}

export type CustomerShopImage = {
  shop_image_id: number;
  image_url: string;
  created_at: string;
};

export type CustomerProfile = {
  customer_id: number;
  user_id: string;
  business_name: string;
  business_location: string;
  contact_person: string;
  phone: string;
  status: string;
  created_at: string;
  profile_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  delivery_notes: string | null;
  shop_images: CustomerShopImage[];
};

export type CustomerProfilePayload = {
  business_name: string;
  business_location: string;
  contact_person: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  delivery_notes?: string;
};

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

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
        "Failed to load your business profile.",
      ),
    );
  }

  return response.json();
}

export async function saveMyCustomerProfile(
  token: string,
  payload: CustomerProfilePayload,
): Promise<CustomerProfile> {
  const response = await fetch(`${API_BASE_URL}/customers/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
        "Failed to save your business profile.",
      ),
    );
  }

  return response.json();
}



export async function uploadCustomerProfileImage(
  token: string,
  image: File,
): Promise<CustomerProfile> {
  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch(`${API_BASE_URL}/customers/me/profile-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "Failed to upload profile picture."),
    );
  }

  return response.json();
}

export async function removeCustomerProfileImage(
  token: string,
): Promise<CustomerProfile> {
  const response = await fetch(`${API_BASE_URL}/customers/me/profile-image`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "Failed to remove profile picture."),
    );
  }

  return response.json();
}

export async function uploadCustomerShopImages(
  token: string,
  images: File[],
): Promise<CustomerProfile> {
  const formData = new FormData();

  images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await fetch(`${API_BASE_URL}/customers/me/shop-images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "Failed to upload shop images."),
    );
  }

  return response.json();
}

export async function removeCustomerShopImage(
  token: string,
  imageId: number,
): Promise<CustomerProfile> {
  const response = await fetch(
    `${API_BASE_URL}/customers/me/shop-images/${imageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "Failed to remove shop image."),
    );
  }

  return response.json();
}

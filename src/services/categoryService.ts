import type { Category } from "./productService";
import { extractErrorMessage } from "../utils/apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function isCategory(value: unknown): value is Category {
  if (!value || typeof value !== "object") {
    return false;
  }

  const category = value as Record<string, unknown>;

  return (
    typeof category.category_id === "number" &&
    typeof category.category_name === "string" &&
    (
      category.description === undefined ||
      category.description === null ||
      typeof category.description === "string"
    )
  );
}

export async function getCategories(
  token: string
): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
        "Failed to load categories."
      )
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    console.error(
      "Unexpected response from GET /categories:",
      data
    );

    throw new Error(
      "The server returned an invalid categories response."
    );
  }

  if (!data.every(isCategory)) {
    console.error(
      "One or more categories have an invalid structure:",
      data
    );

    throw new Error(
      "The server returned invalid category information."
    );
  }

  return data;
}

export async function createCategory(
  token: string,
  category: { category_name: string; description?: string }
): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(category),
  });
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to create category."));
  }
  const data: unknown = await response.json();

if (!isCategory(data)) {
  console.error(
    "Unexpected response from POST /categories:",
    data
  );

  throw new Error(
    "The category was created, but the server returned an invalid response."
  );
}

return data;
}
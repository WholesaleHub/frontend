import type { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductListingPage from "./ProductListingPage";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";

vi.mock("../../layouts/DashboardLayout", () => ({
  default: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ token: "test-token" }),
}));

vi.mock("../../context/CartContext", () => ({
  useCart: () => ({ addToCart: vi.fn() }),
}));

vi.mock("../../components/ui/ProductImage", () => ({
  default: ({ alt }: { alt: string }) => <span>{alt} image</span>,
}));

vi.mock("../../components/ui/StockBadge", () => ({
  default: () => <span>In Stock</span>,
}));

vi.mock("../../services/productService", () => ({
  getProducts: vi.fn(),
}));

vi.mock("../../services/categoryService", () => ({
  getCategories: vi.fn(),
}));

const getProductsMock = vi.mocked(getProducts);
const getCategoriesMock = vi.mocked(getCategories);

const product = {
  product_id: 1,
  product_name: "Maize Flour",
  sku: "MF-001",
  category_id: 10,
  unit_price: "180",
  stock_quantity: 50,
  image_url: null,
  description: "Two-kilogram packet",
  status: "ACTIVE",
  created_at: "2026-09-06T10:00:00.000Z",
};

const categories = [
  {
    category_id: 10,
    category_name: "Food",
    description: "Food products",
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductListingPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  getCategoriesMock.mockResolvedValue(categories);

  getProductsMock.mockResolvedValue({
    data: [product],
    meta: {
      total: 1,
      page: 1,
      limit: 9,
      totalPages: 1,
    },
  });
});

describe("ProductListingPage", () => {
  it("displays products linking to the existing details page", async () => {
    renderPage();

    const productLink = await screen.findByRole("link", {
      name: /maize flour/i,
    });

    expect(productLink).toHaveAttribute("href", "/products/1");
    expect(screen.getByText("Ksh 180")).toBeInTheDocument();
  });

  it("sends search, category and availability filters together", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Maize Flour");

    await user.type(screen.getByPlaceholderText("Search products..."), "maize");

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Category" }),
      "10",
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Availability" }),
      "IN_STOCK",
    );

    await waitFor(() => {
      expect(getProductsMock).toHaveBeenLastCalledWith("test-token", {
        page: 1,
        limit: 9,
        search: "maize",
        category: 10,
        availability: "IN_STOCK",
      });
    });

    expect(getCategoriesMock).toHaveBeenCalledOnce();
  });

  it("clears all active filters", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Maize Flour");

    const search = screen.getByPlaceholderText("Search products...");
    const category = screen.getByRole("combobox", { name: "Category" });
    const availability = screen.getByRole("combobox", {
      name: "Availability",
    });
    const clearButton = screen.getByRole("button", {
      name: "Clear Filters",
    });

    expect(clearButton).toBeDisabled();

    await user.type(search, "maize");
    await user.selectOptions(category, "10");
    await user.selectOptions(availability, "LOW_STOCK");

    expect(clearButton).toBeEnabled();

    await user.click(clearButton);

    expect(search).toHaveValue("");
    expect(category).toHaveValue("all");
    expect(availability).toHaveValue("all");
    expect(clearButton).toBeDisabled();

    await waitFor(() => {
      expect(getProductsMock).toHaveBeenLastCalledWith("test-token", {
        page: 1,
        limit: 9,
        search: undefined,
        category: undefined,
        availability: undefined,
      });
    });
  });

  it("displays an empty state when no products match", async () => {
    getProductsMock.mockResolvedValue({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 9,
        totalPages: 1,
      },
    });

    renderPage();

    expect(
      await screen.findByText("No products match your search."),
    ).toBeInTheDocument();
  });
});

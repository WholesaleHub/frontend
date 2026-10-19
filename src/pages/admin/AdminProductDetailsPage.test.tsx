import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductDetailsPage from "../products/ProductDetailsPage";
import {
  deleteProduct,
  getProductById,
  type Product,
} from "../../services/productService";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    token: "admin-token",
    user: {
      id: "admin-1",
      fullName: "Admin User",
      email: "admin@example.com",
      role: "ADMIN",
    },
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
  }),
}));

vi.mock("../../layouts/DashboardLayout", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("../../services/productService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../services/productService")>();

  return {
    ...actual,
    getProductById: vi.fn(),
    deleteProduct: vi.fn(),
  };
});

const mockedGetProductById = vi.mocked(getProductById);
const mockedDeleteProduct = vi.mocked(deleteProduct);

function createProduct(): Product {
  return {
    product_id: 10,
    product_name: "Premium Rice",
    sku: "RICE-010",
    category_id: 2,
    unit_price: "250",
    stock_quantity: 40,
    image_url: null,
    description: "Premium wholesale rice.",
    status: "ACTIVE",
    created_at: "2026-09-05T10:30:00.000Z",
    stock_status: "IN_STOCK",
    category: {
      category_id: 2,
      category_name: "Grains",
    },
  };
}

function AdminEditDestination() {
  const { id } = useParams<{ id: string }>();

  return <p>Admin edit destination: {id}</p>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/products/10"]}>
      <Routes>
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route
          path="/dashboard/admin/products/:id/edit"
          element={<AdminEditDestination />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProductDetailsPage for an administrator", () => {
  beforeEach(() => {
    mockedGetProductById.mockReset();
    mockedDeleteProduct.mockReset();
  });

  it("shows inventory controls and uses the admin edit route", async () => {
    mockedGetProductById.mockResolvedValue(createProduct());

    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Premium Rice" }),
    ).toBeInTheDocument();

    expect(mockedGetProductById).toHaveBeenCalledWith("10", "admin-token");

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Edit Product" }));

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(
      await screen.findByText("Admin edit destination: 10"),
    ).toBeInTheDocument();

    expect(mockedDeleteProduct).not.toHaveBeenCalled();
  });
});

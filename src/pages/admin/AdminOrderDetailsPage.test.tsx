import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrderDetailsPage from "../retailer/OrderDetailsPage";
import {
  getMyOrderById,
  getOrderById,
  type Order,
} from "../../services/orderService";

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

vi.mock("../../services/orderService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../services/orderService")>();

  return {
    ...actual,
    getMyOrderById: vi.fn(),
    getOrderById: vi.fn(),
    updateOrderStatus: vi.fn(),
  };
});

const mockedGetMyOrderById = vi.mocked(getMyOrderById);
const mockedGetOrderById = vi.mocked(getOrderById);

function createOrder(): Order {
  return {
    order_id: 42,
    customer_id: 7,
    created_by_user_id: "retailer-1",
    order_date: "2026-09-05T10:30:00.000Z",
    status: "SHIPPED",
    total_amount: "1350",
    created_at: "2026-09-05T10:30:00.000Z",
    customer: {
      customer_id: 7,
      business_name: "Coast Retail Shop",
      contact_person: "Jane Retailer",
      phone: "0712345678",
      business_location: "Mombasa",
    } as NonNullable<Order["customer"]>,
    orderItems: [
      {
        order_item_id: 1,
        order_id: 42,
        product_id: 10,
        quantity: 3,
        unit_price: "450",
        subtotal: "1350",
        product: {
          product_name: "Maize Flour",
        } as NonNullable<Order["orderItems"][number]["product"]>,
      },
    ],
  };
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/dashboard/admin/orders/42"]}>
      <Routes>
        <Route
          path="/dashboard/admin/orders/:id"
          element={<OrderDetailsPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("OrderDetailsPage for an administrator", () => {
  beforeEach(() => {
    mockedGetMyOrderById.mockReset();
    mockedGetOrderById.mockReset();
  });

  it("uses the management endpoint and displays operational controls", async () => {
    mockedGetOrderById.mockResolvedValue(createOrder());

    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Order #42" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedGetOrderById).toHaveBeenCalledWith("42", "admin-token");
    });

    expect(mockedGetMyOrderById).not.toHaveBeenCalled();

    expect(
      screen.getByRole("combobox", { name: "Order status" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Update status" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Coast Retail Shop")).toBeInTheDocument();
    expect(screen.getByText("Jane Retailer")).toBeInTheDocument();
    expect(screen.getByText("Mombasa")).toBeInTheDocument();
  });
});

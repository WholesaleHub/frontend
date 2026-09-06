import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrderDetailsPage from "./OrderDetailsPage";
import {
  getMyOrderById,
  getOrderById,
  type Order,
} from "../../services/orderService";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    token: "retailer-token",
    user: {
      id: "retailer-1",
      fullName: "Retailer User",
      email: "retailer@example.com",
      role: "RETAILER",
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

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    order_id: 42,
    customer_id: 7,
    created_by_user_id: "retailer-1",
    order_date: "2026-09-05T10:30:00.000Z",
    status: "SHIPPED",
    total_amount: "1350",
    created_at: "2026-09-05T10:30:00.000Z",
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
    ...overrides,
  };
}

function renderPage(orderId = "42") {
  return render(
    <MemoryRouter initialEntries={[`/dashboard/retailer/orders/${orderId}`]}>
      <Routes>
        <Route
          path="/dashboard/retailer/orders/:id"
          element={<OrderDetailsPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("OrderDetailsPage for a retailer", () => {
  beforeEach(() => {
    mockedGetMyOrderById.mockReset();
    mockedGetOrderById.mockReset();
  });

  it("loads the ownership-scoped order and displays its products", async () => {
    mockedGetMyOrderById.mockResolvedValue(createOrder());

    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Order #42" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedGetMyOrderById).toHaveBeenCalledWith("42", "retailer-token");
    });

    expect(mockedGetOrderById).not.toHaveBeenCalled();

    const productName = screen.getByText("Maize Flour");
    const productRow = productName.closest("tr");

    expect(productRow).not.toBeNull();
    expect(within(productRow!).getByText("3")).toBeInTheDocument();
    expect(within(productRow!).getByText(/450/)).toBeInTheDocument();
    expect(within(productRow!).getByText(/1,350/)).toBeInTheDocument();
  });

  it("marks the current order stage in the progress tracker", async () => {
    mockedGetMyOrderById.mockResolvedValue(createOrder());

    renderPage();

    const progress = await screen.findByRole("list", {
      name: "Order status progression",
    });

    expect(within(progress).getByText("Pending")).toBeInTheDocument();
    expect(within(progress).getByText("Confirmed")).toBeInTheDocument();
    expect(within(progress).getByText("Packed")).toBeInTheDocument();
    expect(within(progress).getByText("Shipped")).toBeInTheDocument();
    expect(within(progress).getByText("Delivered")).toBeInTheDocument();

    const shippedStep = within(progress).getByText("Shipped").closest("li");

    expect(shippedStep).not.toBeNull();
    expect(shippedStep).toHaveAttribute("aria-current", "step");
  });

  it("shows an unavailable state when the scoped endpoint returns 404", async () => {
    mockedGetMyOrderById.mockRejectedValue(new Error("Order not found."));

    renderPage("999");

    expect(
      await screen.findByRole("heading", { name: "Order unavailable" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Order not found.")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedGetMyOrderById).toHaveBeenCalledWith(
        "999",
        "retailer-token",
      );
    });

    expect(mockedGetOrderById).not.toHaveBeenCalled();
  });
});

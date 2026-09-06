import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RetailerOrders from "./RetailerOrders";
import { getMyOrders, type Order } from "../../services/orderService";

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
    getMyOrders: vi.fn(),
  };
});

const mockedGetMyOrders = vi.mocked(getMyOrders);

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    order_id: 42,
    customer_id: 7,
    created_by_user_id: "retailer-1",
    order_date: "2026-09-05T10:30:00.000Z",
    status: "SHIPPED",
    total_amount: "1500",
    created_at: "2026-09-05T10:30:00.000Z",
    orderItems: [
      {
        order_item_id: 1,
        order_id: 42,
        product_id: 10,
        quantity: 2,
        unit_price: "750",
        subtotal: "1500",
      },
    ],
    ...overrides,
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <RetailerOrders />
    </MemoryRouter>,
  );
}

describe("RetailerOrders", () => {
  beforeEach(() => {
    mockedGetMyOrders.mockReset();
  });

  it("displays the authenticated retailer's order history", async () => {
    mockedGetMyOrders.mockResolvedValue({
      data: [createOrder()],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    renderPage();

    const orderNumber = await screen.findByText("#42");
    const orderRow = orderNumber.closest("tr");

    expect(orderRow).not.toBeNull();
    expect(within(orderRow!).getByText("Shipped")).toBeInTheDocument();
    expect(within(orderRow!).getByText(/1,500/)).toBeInTheDocument();

    const detailsLink = screen.getByRole("link", { name: "View" });

    expect(detailsLink).toHaveAttribute(
      "href",
      "/dashboard/retailer/orders/42",
    );

    expect(mockedGetMyOrders).toHaveBeenCalledWith("retailer-token", {
      page: 1,
      limit: 10,
    });
  });

  it("loads the next page using the backend pagination parameters", async () => {
    mockedGetMyOrders
      .mockResolvedValueOnce({
        data: [createOrder()],
        pagination: {
          page: 1,
          limit: 10,
          total: 12,
          totalPages: 2,
        },
      })
      .mockResolvedValueOnce({
        data: [
          createOrder({
            order_id: 43,
            orderItems: [],
          }),
        ],
        pagination: {
          page: 2,
          limit: 10,
          total: 12,
          totalPages: 2,
        },
      });

    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Page 1 of 2");
    await user.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      expect(mockedGetMyOrders).toHaveBeenLastCalledWith("retailer-token", {
        page: 2,
        limit: 10,
      });
    });

    expect(await screen.findByText("#43")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
  });

  it("displays a helpful empty-order state", async () => {
    mockedGetMyOrders.mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });

    renderPage();

    expect(
      await screen.findByText("You have not placed any orders yet."),
    ).toBeInTheDocument();
  });

  it("displays an API error and allows the retailer to retry", async () => {
    mockedGetMyOrders
      .mockRejectedValueOnce(new Error("Unable to retrieve your orders."))
      .mockResolvedValueOnce({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });

    const user = userEvent.setup();
    renderPage();

    expect(
      await screen.findByText("Unable to retrieve your orders."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try Again" }));

    await waitFor(() => {
      expect(mockedGetMyOrders).toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByText("You have not placed any orders yet."),
    ).toBeInTheDocument();
  });
});

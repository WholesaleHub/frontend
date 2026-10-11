import type { ReactNode } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminUserDetailsPage from "./AdminUserDetailsPage";
import {
  findCustomerByUserId,
  getCustomerOrders,
  type CustomerProfile,
} from "../../services/customerService";
import type { Order } from "../../services/orderService";
import { getUserById, type AdminUser } from "../../services/userService";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    token: "admin-token",
    user: {
      id: "admin-1",
      fullName: "Current Admin",
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

vi.mock("../../services/userService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../services/userService")>();

  return {
    ...actual,
    getUserById: vi.fn(),
  };
});

vi.mock("../../services/customerService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../services/customerService")>();

  return {
    ...actual,
    findCustomerByUserId: vi.fn(),
    getCustomerOrders: vi.fn(),
  };
});

const mockedGetUserById = vi.mocked(getUserById);
const mockedFindCustomerByUserId = vi.mocked(findCustomerByUserId);
const mockedGetCustomerOrders = vi.mocked(getCustomerOrders);

const retailer: AdminUser = {
  id: "retailer-1",
  full_name: "Jane Retailer",
  email: "jane@example.com",
  phone: "+254700000000",
  role: "RETAILER",
  status: "ACTIVE",
  created_at: "2026-09-02T08:00:00.000Z",
};

const wholesaler: AdminUser = {
  id: "wholesaler-1",
  full_name: "John Wholesaler",
  email: "john@example.com",
  phone: "+254711111111",
  role: "WHOLESALER",
  status: "ACTIVE",
  created_at: "2026-09-01T08:00:00.000Z",
};

const customer: CustomerProfile = {
  customer_id: 7,
  user_id: "retailer-1",
  business_name: "Jane's Retail Shop",
  business_location: "Mombasa",
  contact_person: "Jane Retailer",
  phone: "+254700000000",
  status: "ACTIVE",
  created_at: "2026-09-02T08:00:00.000Z",
};

function createOrder(
  orderId: number,
  status: Order["status"],
  totalAmount: string,
  orderDate: string,
): Order {
  return {
    order_id: orderId,
    customer_id: 7,
    created_by_user_id: "retailer-1",
    order_date: orderDate,
    status,
    total_amount: totalAmount,
    created_at: orderDate,
    orderItems: [
      {
        order_item_id: orderId,
        order_id: orderId,
        product_id: 10,
        quantity: 2,
        unit_price: "250",
        subtotal: "500",
      },
    ],
  };
}

function renderPage(userId: string) {
  return render(
    <MemoryRouter initialEntries={[`/dashboard/admin/users/${userId}`]}>
      <Routes>
        <Route
          path="/dashboard/admin/users/:id"
          element={<AdminUserDetailsPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AdminUserDetailsPage", () => {
  beforeEach(() => {
    mockedGetUserById.mockReset();
    mockedFindCustomerByUserId.mockReset();
    mockedGetCustomerOrders.mockReset();
  });

  it("displays retailer business information and accurate order metrics", async () => {
    mockedGetUserById.mockResolvedValue(retailer);
    mockedFindCustomerByUserId.mockResolvedValue(customer);
    mockedGetCustomerOrders.mockResolvedValue([
      createOrder(13, "CANCELLED", "300", "2026-10-03T08:00:00.000Z"),
      createOrder(12, "PENDING", "500", "2026-10-02T08:00:00.000Z"),
      createOrder(11, "DELIVERED", "1000", "2026-10-01T08:00:00.000Z"),
    ]);

    renderPage("retailer-1");

    expect(
      await screen.findByRole("heading", { name: "Jane Retailer" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Jane's Retail Shop")).toBeInTheDocument();
    expect(screen.getByText("Mombasa")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedGetUserById).toHaveBeenCalledWith(
        "admin-token",
        "retailer-1",
      );

      expect(mockedFindCustomerByUserId).toHaveBeenCalledWith(
        "admin-token",
        "retailer-1",
      );

      expect(mockedGetCustomerOrders).toHaveBeenCalledWith("admin-token", 7);
    });

    const totalOrdersCard =
      screen.getByText("Total orders").parentElement?.parentElement;

    const lifetimeSpendCard =
      screen.getByText("Lifetime spend").parentElement?.parentElement;

    const averageOrderCard = screen.getByText("Average order value")
      .parentElement?.parentElement;

    expect(totalOrdersCard).not.toBeNull();
    expect(lifetimeSpendCard).not.toBeNull();
    expect(averageOrderCard).not.toBeNull();

    expect(within(totalOrdersCard!).getByText("3")).toBeInTheDocument();
    expect(within(lifetimeSpendCard!).getByText(/1,500/)).toBeInTheDocument();
    expect(within(averageOrderCard!).getByText(/750/)).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "#13" })).toHaveAttribute(
      "href",
      "/dashboard/admin/orders/13",
    );
  });

  it("does not present platform-wide analytics as wholesaler performance", async () => {
    mockedGetUserById.mockResolvedValue(wholesaler);

    renderPage("wholesaler-1");

    expect(
      await screen.findByRole("heading", {
        name: "John Wholesaler",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Seller analytics unavailable",
      }),
    ).toBeInTheDocument();

    expect(mockedFindCustomerByUserId).not.toHaveBeenCalled();
    expect(mockedGetCustomerOrders).not.toHaveBeenCalled();
    expect(screen.queryByText("Lifetime spend")).not.toBeInTheDocument();
  });

  it("shows a clear error when the requested user cannot be found", async () => {
    mockedGetUserById.mockRejectedValue(new Error("User not found."));

    renderPage("missing-user");

    expect(
      await screen.findByRole("heading", {
        name: "User unavailable",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("User not found.")).toBeInTheDocument();
    expect(mockedFindCustomerByUserId).not.toHaveBeenCalled();
    expect(mockedGetCustomerOrders).not.toHaveBeenCalled();
  });
});

import type { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CheckoutPage from "./CheckoutPage";
import { useCart, type CartItem } from "../../context/CartContext";
import { createOrder, type Order } from "../../services/orderService";
import {
  getMyCustomerProfile,
  type CustomerProfile,
} from "../../services/customerService";

vi.mock("../../layouts/DashboardLayout", () => ({
  default: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ token: "test-token" }),
}));

vi.mock("../../context/CartContext", () => ({
  useCart: vi.fn(),
}));

vi.mock("../../services/orderService", () => ({
  createOrder: vi.fn(),
}));

vi.mock("../../services/customerService", () => ({
  getMyCustomerProfile: vi.fn(),
}));

vi.mock("../../components/ui/ProductImage", () => ({
  default: ({ alt }: { alt: string }) => <span>{alt} image</span>,
}));

const useCartMock = vi.mocked(useCart);
const createOrderMock = vi.mocked(createOrder);
const getMyCustomerProfileMock = vi.mocked(getMyCustomerProfile);

const clearCart = vi.fn();
const addToCart = vi.fn();
const removeFromCart = vi.fn();
const increaseQuantity = vi.fn();
const decreaseQuantity = vi.fn();

const cartItem: CartItem = {
  product_id: "1",
  product_name: "Maize Flour",
  unit_price: 180,
  stock_quantity: 20,
  quantity: 2,
};

const profile = {
  customer_id: 4,
  business_name: "Karis Retail Shop",
  business_location: "Mombasa",
  contact_person: "Brian Sechelo",
  phone: "0700000000",
} as CustomerProfile;

const createdOrder = {
  order_id: 42,
} as Order;

function renderPage() {
  return render(
    <MemoryRouter>
      <CheckoutPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  useCartMock.mockReturnValue({
    cart: [cartItem],
    cartCount: 2,
    cartTotal: 360,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  });

  getMyCustomerProfileMock.mockResolvedValue(profile);
  createOrderMock.mockResolvedValue(createdOrder);
});

describe("CheckoutPage", () => {
  it("creates an order, clears the cart and displays confirmation", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("Karis Retail Shop")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Place Order" }));

    await waitFor(() => {
      expect(createOrderMock).toHaveBeenCalledWith("test-token", {
        items: [
          {
            product_id: 1,
            quantity: 2,
          },
        ],
      });
    });

    expect(clearCart).toHaveBeenCalledOnce();

    expect(
      await screen.findByRole("heading", {
        name: "Order placed successfully",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Order #42 has been received/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "View My Orders" }),
    ).toHaveAttribute("href", "/dashboard/retailer/orders");
  });

  it("displays a meaningful error and preserves the cart when checkout fails", async () => {
    const user = userEvent.setup();

    createOrderMock.mockRejectedValue(
      new Error("Insufficient stock for Maize Flour."),
    );

    renderPage();

    await screen.findByText("Karis Retail Shop");

    await user.click(screen.getByRole("button", { name: "Place Order" }));

    expect(
      await screen.findByText("Insufficient stock for Maize Flour."),
    ).toBeInTheDocument();

    expect(clearCart).not.toHaveBeenCalled();
    expect(screen.getByText("Maize Flour")).toBeInTheDocument();
  });

  it("disables the order button while the request is processing", async () => {
    const user = userEvent.setup();

    let resolveOrder!: (order: Order) => void;

    createOrderMock.mockReturnValue(
      new Promise<Order>((resolve) => {
        resolveOrder = resolve;
      }),
    );

    renderPage();

    await screen.findByText("Karis Retail Shop");

    await user.click(screen.getByRole("button", { name: "Place Order" }));

    expect(
      screen.getByRole("button", { name: "Placing Order..." }),
    ).toBeDisabled();

    await act(async () => {
      resolveOrder(createdOrder);
    });

    expect(
      await screen.findByRole("heading", {
        name: "Order placed successfully",
      }),
    ).toBeInTheDocument();
  });
});

import type { PropsWithChildren } from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CartProvider, useCart, type CartItem } from "./CartContext";

const product: Omit<CartItem, "quantity"> = {
  product_id: "1",
  product_name: "Maize Flour",
  unit_price: 180,
  stock_quantity: 2,
};

function wrapper({ children }: PropsWithChildren) {
  return <CartProvider>{children}</CartProvider>;
}

beforeEach(() => {
  localStorage.clear();
});

describe("CartContext", () => {
  it("adds a product and calculates its count and total", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0]).toMatchObject({
      product_id: "1",
      quantity: 1,
    });
    expect(result.current.cartCount).toBe(1);
    expect(result.current.cartTotal).toBe(180);
  });

  it("increases quantity without exceeding available stock", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product);
      result.current.addToCart(product);
      result.current.increaseQuantity(product.product_id);
    });

    expect(result.current.cart[0].quantity).toBe(2);
    expect(result.current.cartCount).toBe(2);
    expect(result.current.cartTotal).toBe(360);
  });

  it("does not add an out-of-stock product", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart({
        ...product,
        product_id: "2",
        stock_quantity: 0,
      });
    });

    expect(result.current.cart).toEqual([]);
    expect(result.current.cartCount).toBe(0);
    expect(result.current.cartTotal).toBe(0);
  });

  it("removes a product when its quantity is decreased below one", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product);
    });

    act(() => {
      result.current.decreaseQuantity(product.product_id);
    });

    expect(result.current.cart).toEqual([]);
  });

  it("removes individual products and clears the entire cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product);
      result.current.addToCart({
        ...product,
        product_id: "2",
        product_name: "Cooking Oil",
      });
    });

    act(() => {
      result.current.removeFromCart("1");
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].product_id).toBe("2");

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cart).toEqual([]);
    expect(result.current.cartTotal).toBe(0);
  });
});

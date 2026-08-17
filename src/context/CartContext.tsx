import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  product_id: string;
  product_name: string;
  unit_price: number;
  image_url?: string;
  stock_quantity: number;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "shopping-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.product_id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + 1, existing.stock_quantity);
        return prev.map((item) =>
          item.product_id === product.product_id ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prev, { ...product, quantity: Math.min(1, product.stock_quantity) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const increaseQuantity = (productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: Math.min(item.quantity + 1, item.stock_quantity) }
          : item
      )
    );
  };

  const decreaseQuantity = (productId: string) => {
    setCart((prev) =>
      prev
        .map((item) => (item.product_id === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{ cart, cartCount, cartTotal, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
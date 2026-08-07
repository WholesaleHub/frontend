import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { retailerNavItems } from "../../config/retailerNav";
import { useCart } from "../../context/CartContext";
import ProductImage from "../../components/ui/ProductImage";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function ShoppingCartPage() {
  const { cart, cartTotal, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <DashboardLayout navItems={retailerNavItems}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#003049]">Shopping Cart</h1>
        {cart.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <ShoppingCart size={70} className="mx-auto text-gray-300 mb-5" />
          <h2 className="text-2xl font-semibold text-gray-700">Your cart is empty</h2>
          <p className="text-gray-500 mt-2 mb-6">Browse products and add them to your shopping cart.</p>
          <Link
            to="/dashboard/retailer/browse"
            className="inline-flex items-center gap-2 bg-[#003049] hover:bg-[#00253b] text-white px-6 py-3 rounded-lg"
          >
            <ArrowLeft size={18} /> Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {cart.map((item) => {
              const atMaxStock = item.quantity >= item.stock_quantity;
              return (
                <div
                  key={item.product_id}
                  className="bg-white rounded-xl shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5"
                >
                  <div className="flex items-center gap-5">
                    <ProductImage
                      imageUrl={item.image_url}
                      alt={item.product_name}
                      className="w-24 h-24 rounded-lg border"
                      iconSize={28}
                    />
                    <div>
                      <h2 className="font-bold text-lg text-[#003049]">{item.product_name}</h2>
                      <p className="text-[#f77f00] font-semibold mt-1">
                        Ksh {item.unit_price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Stock available: {item.stock_quantity}</p>
                      {atMaxStock && (
                        <p className="text-xs text-[#d62828] mt-1">Maximum available quantity reached</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decreaseQuantity(item.product_id)}
                      className="bg-gray-200 hover:bg-gray-300 rounded-lg p-2"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-semibold text-lg w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(item.product_id)}
                      disabled={atMaxStock}
                      className="bg-gray-200 hover:bg-gray-300 rounded-lg p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-xl text-[#003049]">
                      Ksh {(item.unit_price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => setPendingRemove(item.product_id)}
                      className="mt-3 inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl shadow-md mt-8 p-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-[#003049]">Total</h2>
              <p className="text-3xl font-bold text-[#f77f00] mt-2">Ksh {cartTotal.toLocaleString()}</p>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="bg-[#003049] hover:bg-[#00253b] text-white px-8 py-3 rounded-lg font-medium"
            >
              Checkout
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={!!pendingRemove}
        title="Remove Item"
        message="Remove this item from your cart?"
        confirmLabel="Remove"
        danger
        onConfirm={() => {
          if (pendingRemove) removeFromCart(pendingRemove);
          setPendingRemove(null);
        }}
        onCancel={() => setPendingRemove(null)}
      />
      <ConfirmDialog
        isOpen={confirmClear}
        title="Clear Cart"
        message="Remove all items from your cart? This cannot be undone."
        confirmLabel="Clear Cart"
        danger
        onConfirm={() => {
          clearCart();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </DashboardLayout>
  );
}
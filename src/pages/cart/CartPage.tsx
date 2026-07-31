import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { retailerNavItems } from "../../config/retailerNav";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    cartTotal,
  } = useCart();

  return (
    <DashboardLayout navItems={retailerNavItems}>
      <h1 className="text-3xl font-bold text-[#003049] mb-6">
        Shopping Cart
      </h1>

      {cart.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <ShoppingCart
            size={60}
            className="mx-auto text-gray-300 mb-4"
          />

          <h2 className="text-xl font-semibold mb-2">
            Your cart is empty
          </h2>

          <p className="text-gray-500">
            Add products to your cart to see them here.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {cart.map((item) => (
              <div
                key={item.product_id}
                className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  <div>
                    <h2 className="font-semibold text-lg">
                      {item.product_name}
                    </h2>

                    <p className="text-[#f77f00] font-semibold">
                      Ksh {Number(item.unit_price).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      decreaseQuantity(item.product_id)
                    }
                    className="bg-gray-100 p-2 rounded hover:bg-gray-200"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="font-semibold text-lg">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      increaseQuantity(item.product_id)
                    }
                    className="bg-gray-100 p-2 rounded hover:bg-gray-200"
                  >
                    <Plus size={16} />
                  </button>

                  <button
                    onClick={() =>
                      removeFromCart(item.product_id)
                    }
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 ml-4"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-md mt-8 p-6 flex justify-between items-center">
            <h2 className="text-xl font-bold">
              Total
            </h2>

            <span className="text-2xl font-bold text-[#f77f00]">
              Ksh {cartTotal.toLocaleString()}
            </span>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
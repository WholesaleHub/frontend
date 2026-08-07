import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { retailerNavItems } from "../../config/retailerNav";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { createOrder } from "../../services/orderService";
import {
  getMyCustomerProfile,
  type CustomerProfile,
} from "../../services/customerService";
import ProductImage from "../../components/ui/ProductImage";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<CustomerProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] =
    useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setIsProfileLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setIsProfileLoading(true);
      setError("");

      try {
        const result =
          await getMyCustomerProfile(token!);

        if (!cancelled) {
          setProfile(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load your business profile."
          );
        }
      } finally {
        if (!cancelled) {
          setIsProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handlePlaceOrder() {
    if (
      !token ||
      !profile ||
      cart.length === 0 ||
      isSubmitting
    ) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await createOrder(token, {
        items: cart.map((item) => ({
          product_id: Number(item.product_id),
          quantity: item.quantity,
        })),
      });

      clearCart();
      navigate("/dashboard/retailer/orders");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to place order."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (cart.length === 0) {
    return (
      <DashboardLayout navItems={retailerNavItems}>
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <p className="text-gray-500 mb-4">
            Your cart is empty — nothing to check out.
          </p>

          <Link
            to="/dashboard/retailer/browse"
            className="text-[#f77f00] font-medium hover:underline"
          >
            Browse Products
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={retailerNavItems}>
      <Link
        to="/cart"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#003049] mb-6 w-fit"
      >
        <ArrowLeft size={16} />
        Back to Cart
      </Link>

      <h1 className="text-2xl font-bold text-[#003049] mb-6">
        Checkout
      </h1>

      {error && (
        <p className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-semibold text-[#003049]">
                  Business Details
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Confirm the business information associated
                  with this order.
                </p>
              </div>

              {profile && (
                <Link
                  to="/profile"
                  className="flex items-center gap-1 text-sm font-medium text-[#f77f00] hover:underline"
                >
                  <Pencil size={14} />
                  Edit Profile
                </Link>
              )}
            </div>

            {isProfileLoading ? (
              <p className="text-sm text-gray-400">
                Loading business profile...
              </p>
            ) : !profile ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="font-medium text-yellow-800">
                  Business profile required
                </p>

                <p className="text-sm text-yellow-700 mt-1">
                  Complete your business profile before placing
                  this order.
                </p>

                <Link
                  to="/profile"
                  className="inline-flex mt-3 text-sm font-medium text-[#f77f00] hover:underline"
                >
                  Complete Business Profile
                </Link>
              </div>
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border bg-gray-50 p-4">
                  <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Building2 size={15} />
                    Business Name
                  </dt>

                  <dd className="mt-2 text-sm font-medium text-[#003049]">
                    {profile.business_name}
                  </dd>
                </div>

                <div className="rounded-lg border bg-gray-50 p-4">
                  <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <MapPin size={15} />
                    Business Location
                  </dt>

                  <dd className="mt-2 text-sm font-medium text-[#003049]">
                    {profile.business_location}
                  </dd>
                </div>

                <div className="rounded-lg border bg-gray-50 p-4">
                  <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <User size={15} />
                    Contact Person
                  </dt>

                  <dd className="mt-2 text-sm font-medium text-[#003049]">
                    {profile.contact_person}
                  </dd>
                </div>

                <div className="rounded-lg border bg-gray-50 p-4">
                  <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Phone size={15} />
                    Phone Number
                  </dt>

                  <dd className="mt-2 text-sm font-medium text-[#003049]">
                    {profile.phone}
                  </dd>
                </div>
              </dl>
            )}
          </section>

          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-[#003049] mb-4">
              Order Summary
            </h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div className="flex items-center gap-3">
                    <ProductImage
                      imageUrl={item.image_url}
                      alt={item.product_name}
                      className="w-14 h-14 rounded-lg"
                      iconSize={18}
                    />

                    <div>
                      <p className="font-medium text-[#003049] text-sm">
                        {item.product_name}
                      </p>

                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold text-sm text-[#003049]">
                    Ksh{" "}
                    {(
                      item.unit_price * item.quantity
                    ).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="font-semibold text-[#003049] mb-4">
            Total
          </h2>

          <p className="text-3xl font-bold text-[#f77f00] mb-6">
            Ksh {cartTotal.toLocaleString()}
          </p>

          <div className="flex items-start gap-2 text-xs text-gray-500 mb-6">
            <ShieldCheck
              size={16}
              className="text-green-600 shrink-0 mt-0.5"
            />

            Final pricing and stock availability are verified
            by the server when your order is placed.
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={
              isSubmitting ||
              isProfileLoading ||
              !profile
            }
            className="w-full bg-[#003049] hover:bg-[#00253b] text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isProfileLoading
              ? "Loading Profile..."
              : isSubmitting
                ? "Placing Order..."
                : !profile
                  ? "Complete Profile First"
                  : "Place Order"}
          </button>
        </aside>
      </div>
    </DashboardLayout>
  );
}
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Building2,
  MapPin,
  Phone,
  Save,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import { wholesalerNavItems } from "../config/wholesalerNav";
import { retailerNavItems } from "../config/retailerNav";
import {
  getMyCustomerProfile,
  saveMyCustomerProfile,
} from "../services/customerService";

function ProfilePage() {
  const { user, token } = useAuth();

  const isRetailer = user?.role === "RETAILER";
  const isWholesaler = user?.role === "WHOLESALER";

  const navItems = isWholesaler
    ? wholesalerNavItems
    : retailerNavItems;

  const [businessName, setBusinessName] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [contactPerson, setContactPerson] = useState(
    user?.fullName ?? ""
  );
  const [phone, setPhone] = useState("");

  const [isLoading, setIsLoading] = useState(isRetailer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    if (!isRetailer || !token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setError("");

      try {
        const profile = await getMyCustomerProfile(token!);

        if (cancelled) return;

        if (profile) {
          setProfileExists(true);
          setBusinessName(profile.business_name);
          setBusinessLocation(profile.business_location);
          setContactPerson(profile.contact_person);
          setPhone(profile.phone);
        } else {
          setProfileExists(false);
          setContactPerson(user?.fullName ?? "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load your profile."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isRetailer, token, user?.fullName]);

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!token || !isRetailer || isSubmitting) return;

    setError("");
    setSaved(false);

    if (
      !businessName.trim() ||
      !businessLocation.trim() ||
      !contactPerson.trim() ||
      !phone.trim()
    ) {
      setError("Please complete all business profile fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const profile = await saveMyCustomerProfile(token, {
        business_name: businessName.trim(),
        business_location: businessLocation.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
      });

      setBusinessName(profile.business_name);
      setBusinessLocation(profile.business_location);
      setContactPerson(profile.contact_person);
      setPhone(profile.phone);
      setProfileExists(true);
      setSaved(true);

      window.dispatchEvent(
        new CustomEvent("customer-profile-updated")
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save your business profile."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardLayout navItems={navItems}>
      <h1 className="text-2xl font-bold text-[#003049] mb-2">
        My Profile
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Manage your account and business information.
      </p>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#f77f00] flex items-center justify-center text-white">
            <User size={32} />
          </div>

          <div>
            <p className="font-semibold text-[#003049]">
              {user?.fullName}
            </p>
            <p className="text-sm text-gray-500 capitalize">
              {user?.role.toLowerCase()}
            </p>
          </div>
        </div>

        {error && (
          <p className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">
            {error}
          </p>
        )}

        {saved && (
          <p className="bg-green-100 text-green-700 text-sm p-3 rounded mb-4">
            Business profile updated successfully.
          </p>
        )}

        {!isRetailer && (
          <p className="bg-blue-50 text-blue-700 text-sm p-3 rounded mb-4">
            Business customer information is required only for
            retailer accounts.
          </p>
        )}

        <section className="mb-6">
          <h2 className="font-semibold text-[#003049] mb-3">
            Account Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={user?.fullName ?? ""}
                  readOnly
                  className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                  className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </section>

        {isRetailer && (
          <>
            <div className="border-t mb-6" />

            <section>
              <div className="mb-4">
                <h2 className="font-semibold text-[#003049]">
                  Business Information
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  This information will appear during checkout.
                </p>
              </div>

              {isLoading ? (
                <p className="text-sm text-gray-500">
                  Loading business profile...
                </p>
              ) : (
                <form
                  onSubmit={handleSave}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {!profileExists && (
                    <p className="sm:col-span-2 bg-yellow-50 text-yellow-800 text-sm p-3 rounded">
                      Please complete your business profile before
                      placing an order.
                    </p>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Business Name
                    </label>

                    <div className="relative">
                      <Building2
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="text"
                        value={businessName}
                        onChange={(event) =>
                          setBusinessName(event.target.value)
                        }
                        required
                        maxLength={100}
                        className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                        placeholder="Your business name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Business Location
                    </label>

                    <div className="relative">
                      <MapPin
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="text"
                        value={businessLocation}
                        onChange={(event) =>
                          setBusinessLocation(event.target.value)
                        }
                        required
                        maxLength={150}
                        className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                        placeholder="Mombasa, Kenya"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Contact Person
                    </label>

                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="text"
                        value={contactPerson}
                        onChange={(event) =>
                          setContactPerson(event.target.value)
                        }
                        required
                        maxLength={100}
                        className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                        placeholder="Contact person's name"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Business Phone Number
                    </label>

                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="tel"
                        value={phone}
                        onChange={(event) =>
                          setPhone(event.target.value)
                        }
                        required
                        className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                        placeholder="0712345678"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="sm:col-span-2 flex items-center justify-center gap-2 bg-[#f77f00] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#d62828] disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />

                    {isSubmitting
                      ? "Saving..."
                      : profileExists
                        ? "Update Business Profile"
                        : "Complete Business Profile"}
                  </button>
                </form>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;
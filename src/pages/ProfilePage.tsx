import { Building2, Mail, MapPin, Phone, Save, User } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import { wholesalerNavItems } from "../config/wholesalerNav";
import { retailerNavItems } from "../config/retailerNav";
import {
  getMyCustomerProfile,
  updateMyCustomerProfile,
  type CustomerProfile,
} from "../services/customerService";
import ErrorState from "../components/ui/ErrorState";
import { Skeleton } from "../components/ui/Skeleton";

function ProfilePage() {
  const { user, token } = useAuth();

  const isRetailer = user?.role === "RETAILER";
  const isWholesaler = user?.role === "WHOLESALER";

  const navItems = isWholesaler ? wholesalerNavItems : retailerNavItems;

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [contactPerson, setContactPerson] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState("");

  const [isLoading, setIsLoading] = useState(isRetailer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const applyProfile = useCallback(
    (nextProfile: CustomerProfile) => {
      setProfile(nextProfile);
      setBusinessName(nextProfile.business_name ?? "");
      setBusinessLocation(nextProfile.business_location ?? "");
      setContactPerson(nextProfile.contact_person || user?.fullName || "");
      setPhone(nextProfile.phone ?? "");
    },
    [user?.fullName],
  );

  const loadProfile = useCallback(async () => {
    if (!isRetailer || !token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const nextProfile = await getMyCustomerProfile(token);

      if (!nextProfile) {
        setProfile(null);
        setError("No customer profile is linked to this account.");
        return;
      }

      applyProfile(nextProfile);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your business profile.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [applyProfile, isRetailer, token]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !isRetailer || !profile || isSubmitting) {
      return;
    }

    setError("");
    setSuccess("");

    const payload = {
      business_name: businessName.trim(),
      business_location: businessLocation.trim(),
      contact_person: contactPerson.trim(),
      phone: phone.trim(),
    };

    if (
      !payload.business_name ||
      !payload.business_location ||
      !payload.contact_person ||
      !payload.phone
    ) {
      setError("Please complete all business profile fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedProfile = await updateMyCustomerProfile(token, payload);

      applyProfile(updatedProfile);
      setSuccess("Business profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update your business profile.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#003049]">My Profile</h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your account and business information.
        </p>
      </div>

      <div className="max-w-4xl rounded-lg bg-white p-6 shadow">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#f77f00] text-white">
            <User size={34} />
          </div>

          <div>
            <p className="font-semibold text-[#003049]">{user?.fullName}</p>

            <p className="text-sm capitalize text-gray-500">
              {user?.role.toLowerCase()}
            </p>
          </div>
        </div>

        <section>
          <h2 className="mb-3 font-semibold text-[#003049]">
            Account Information
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReadOnlyField
              icon={User}
              label="Full Name"
              value={user?.fullName ?? ""}
            />

            <ReadOnlyField
              icon={Mail}
              label="Email Address"
              value={user?.email ?? ""}
              type="email"
            />
          </div>
        </section>

        {!isRetailer && (
          <p className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
            Business profile information applies to retailer accounts only.
          </p>
        )}

        {isRetailer && (
          <>
            <div className="my-6 border-t" />

            {isLoading ? (
              <ProfileSkeleton />
            ) : error && !profile ? (
              <ErrorState
                title="Profile unavailable"
                message={error}
                onRetry={() => void loadProfile()}
              />
            ) : (
              <>
                {error && (
                  <p className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                {success && (
                  <p className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">
                    {success}
                  </p>
                )}

                <form
                  onSubmit={handleSave}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <div className="sm:col-span-2">
                    <h2 className="font-semibold text-[#003049]">
                      Business Information
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      This information is used for customer and order
                      management.
                    </p>
                  </div>

                  <InputField
                    icon={Building2}
                    label="Business Name"
                    value={businessName}
                    onChange={setBusinessName}
                    placeholder="Your business name"
                    maxLength={255}
                    fullWidth
                  />

                  <InputField
                    icon={MapPin}
                    label="Business Location"
                    value={businessLocation}
                    onChange={setBusinessLocation}
                    placeholder="Kabete Road, Nairobi"
                    maxLength={255}
                  />

                  <InputField
                    icon={User}
                    label="Contact Person"
                    value={contactPerson}
                    onChange={setContactPerson}
                    placeholder="Contact person's name"
                    maxLength={255}
                  />

                  <InputField
                    icon={Phone}
                    label="Business Phone Number"
                    value={phone}
                    onChange={setPhone}
                    placeholder="0712345678"
                    maxLength={20}
                    type="tel"
                    fullWidth
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting || !profile}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#f77f00] py-2 text-sm font-medium text-white hover:bg-[#d62828] disabled:cursor-not-allowed disabled:bg-gray-300 sm:col-span-2"
                  >
                    <Save size={16} />

                    {isSubmitting ? "Saving..." : "Update Business Profile"}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Skeleton className="h-5 w-40 sm:col-span-2" />
      <Skeleton className="h-10 w-full sm:col-span-2" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full sm:col-span-2" />
    </div>
  );
}

type FieldIcon = typeof User;

type InputFieldProps = {
  icon: FieldIcon;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  type?: string;
  fullWidth?: boolean;
};

function InputField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
  fullWidth = false,
}: InputFieldProps) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          maxLength={maxLength}
          className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

type ReadOnlyFieldProps = {
  icon: FieldIcon;
  label: string;
  value: string;
  type?: string;
};

function ReadOnlyField({
  icon: Icon,
  label,
  value,
  type = "text",
}: ReadOnlyFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type={type}
          value={value}
          readOnly
          className="w-full cursor-not-allowed rounded-lg border bg-gray-100 py-2 pl-9 pr-3 text-sm text-gray-600"
        />
      </div>
    </div>
  );
}

export default ProfilePage;

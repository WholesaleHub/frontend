import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Building2,
  Camera,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash2,
  UploadCloud,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import { wholesalerNavItems } from "../config/wholesalerNav";
import { retailerNavItems } from "../config/retailerNav";
import {
  getMyCustomerProfile,
  removeCustomerProfileImage,
  removeCustomerShopImage,
  resolveCustomerImageUrl,
  saveMyCustomerProfile,
  uploadCustomerProfileImage,
  uploadCustomerShopImages,
  type CustomerProfile,
  type CustomerShopImage,
} from "../services/customerService";
import ShopLocationPicker from "../components/maps/ShopLocationPicker";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const PROFILE_IMAGE_LIMIT = 5 * 1024 * 1024;
const SHOP_IMAGE_LIMIT = 10 * 1024 * 1024;
const MAX_SHOP_IMAGES = 5;

function ProfilePage() {
  const { user, token } = useAuth();

  const isRetailer = user?.role === "RETAILER";
  const isWholesaler = user?.role === "WHOLESALER";

  const navItems = isWholesaler ? wholesalerNavItems : retailerNavItems;

  const [businessName, setBusinessName] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [contactPerson, setContactPerson] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [shopImages, setShopImages] = useState<CustomerShopImage[]>([]);

  const [isLoading, setIsLoading] = useState(isRetailer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [isUploadingShopImages, setIsUploadingShopImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileExists, setProfileExists] = useState(false);

  function applyProfile(profile: CustomerProfile) {
    setBusinessName(profile.business_name);
    setBusinessLocation(profile.business_location);
    setContactPerson(profile.contact_person);
    setPhone(profile.phone);
    setDeliveryNotes(profile.delivery_notes ?? "");
    setLatitude(profile.latitude);
    setLongitude(profile.longitude);
    setProfileImageUrl(profile.profile_image_url);
    setShopImages(profile.shop_images ?? []);
    setProfileExists(true);
  }

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

        if (cancelled) {
          return;
        }

        if (profile) {
          applyProfile(profile);
        } else {
          setProfileExists(false);
          setContactPerson(user?.fullName ?? "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load your profile.",
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

  function validateImage(file: File, maximumSize: number): string | null {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPG, PNG and WebP images are allowed.";
    }

    if (file.size > maximumSize) {
      return `Image must not exceed ${maximumSize / 1024 / 1024} MB.`;
    }

    return null;
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !isRetailer || isSubmitting) {
      return;
    }

    setError("");
    setSuccess("");

    if (
      !businessName.trim() ||
      !businessLocation.trim() ||
      !contactPerson.trim() ||
      !phone.trim()
    ) {
      setError("Please complete all required business profile fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const profile = await saveMyCustomerProfile(token, {
        business_name: businessName.trim(),
        business_location: businessLocation.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        delivery_notes: deliveryNotes.trim(),
        ...(latitude !== null && longitude !== null
          ? {
              latitude,
              longitude,
            }
          : {}),
      });

      applyProfile(profile);
      setSuccess("Business profile updated successfully.");

      window.dispatchEvent(new CustomEvent("customer-profile-updated"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save your business profile.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleProfileImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !token) {
      return;
    }

    setError("");
    setSuccess("");

    if (!profileExists) {
      setError(
        "Save your business profile before uploading a profile picture.",
      );
      return;
    }

    const validationError = validateImage(file, PROFILE_IMAGE_LIMIT);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploadingProfileImage(true);

    try {
      const profile = await uploadCustomerProfileImage(token, file);

      applyProfile(profile);
      window.dispatchEvent(new CustomEvent("customer-profile-updated"));
      setSuccess("Profile picture updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload profile picture.",
      );
    } finally {
      setIsUploadingProfileImage(false);
    }
  }

  async function handleRemoveProfileImage() {
    if (!token || !profileImageUrl) {
      return;
    }

    setError("");
    setSuccess("");
    setIsUploadingProfileImage(true);

    try {
      const profile = await removeCustomerProfileImage(token);

      applyProfile(profile);
      window.dispatchEvent(new CustomEvent("customer-profile-updated"));
      setSuccess("Profile picture removed.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove profile picture.",
      );
    } finally {
      setIsUploadingProfileImage(false);
    }
  }

  async function handleShopImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length || !token) {
      return;
    }

    setError("");
    setSuccess("");

    if (!profileExists) {
      setError("Save your business profile before uploading shop images.");
      return;
    }

    if (shopImages.length + files.length > MAX_SHOP_IMAGES) {
      setError(`You can have a maximum of ${MAX_SHOP_IMAGES} shop images.`);
      return;
    }

    for (const file of files) {
      const validationError = validateImage(file, SHOP_IMAGE_LIMIT);

      if (validationError) {
        setError(`${file.name}: ${validationError}`);
        return;
      }
    }

    setIsUploadingShopImages(true);

    try {
      const profile = await uploadCustomerShopImages(token, files);

      applyProfile(profile);
      setSuccess("Shop images uploaded successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload shop images.",
      );
    } finally {
      setIsUploadingShopImages(false);
    }
  }

  async function handleRemoveShopImage(imageId: number) {
    if (!token) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingImageId(imageId);

    try {
      const profile = await removeCustomerShopImage(token, imageId);

      applyProfile(profile);
      setSuccess("Shop image removed.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove shop image.",
      );
    } finally {
      setDeletingImageId(null);
    }
  }

  const resolvedProfileImage = resolveCustomerImageUrl(profileImageUrl);

  return (
    <DashboardLayout navItems={navItems}>
      <h1 className="mb-2 text-2xl font-bold text-[#003049]">My Profile</h1>

      <p className="mb-6 text-sm text-gray-500">
        Manage your account, shop and delivery information.
      </p>

      <div className="max-w-4xl rounded-lg bg-white p-6 shadow">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            {resolvedProfileImage ? (
              <img
                src={resolvedProfileImage}
                alt={`${user?.fullName ?? "Retailer"} profile`}
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f77f00] text-white">
                <User size={40} />
              </div>
            )}

            {isRetailer && profileExists && (
              <label
                className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-[#003049] p-2 text-white shadow hover:bg-[#f77f00]"
                title="Upload profile picture"
              >
                <Camera size={16} />

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={isUploadingProfileImage}
                  onChange={handleProfileImage}
                />
              </label>
            )}
          </div>

          <div className="flex-1">
            <p className="font-semibold text-[#003049]">{user?.fullName}</p>
            <p className="text-sm capitalize text-gray-500">
              {user?.role.toLowerCase()}
            </p>

            {isRetailer && (
              <div className="mt-2 flex flex-wrap gap-2">
                <label className="cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium text-[#003049] hover:bg-gray-50">
                  {isUploadingProfileImage
                    ? "Uploading..."
                    : profileImageUrl
                      ? "Replace picture"
                      : "Add picture"}

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={!profileExists || isUploadingProfileImage}
                    onChange={handleProfileImage}
                  />
                </label>

                {profileImageUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveProfileImage}
                    disabled={isUploadingProfileImage}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">
            {success}
          </p>
        )}

        {!isRetailer && (
          <p className="mb-4 rounded bg-blue-50 p-3 text-sm text-blue-700">
            Business customer information is required only for retailer
            accounts.
          </p>
        )}

        <section className="mb-6">
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

        {isRetailer && (
          <>
            <div className="mb-6 border-t" />

            {isLoading ? (
              <p className="text-sm text-gray-500">
                Loading business profile...
              </p>
            ) : (
              <>
                <form
                  onSubmit={handleSave}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <div className="sm:col-span-2">
                    <h2 className="font-semibold text-[#003049]">
                      Business Information
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      This information is used during checkout and delivery.
                    </p>
                  </div>

                  {!profileExists && (
                    <p className="rounded bg-yellow-50 p-3 text-sm text-yellow-800 sm:col-span-2">
                      Complete and save your business profile before adding
                      pictures or a map location.
                    </p>
                  )}

                  <InputField
                    icon={Building2}
                    label="Business Name"
                    value={businessName}
                    onChange={setBusinessName}
                    placeholder="Your business name"
                    maxLength={150}
                    fullWidth
                  />

                  <InputField
                    icon={MapPin}
                    label="Written Business Location"
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
                    maxLength={100}
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

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Delivery Instructions
                    </label>
                    <textarea
                      value={deliveryNotes}
                      onChange={(event) => setDeliveryNotes(event.target.value)}
                      rows={3}
                      maxLength={500}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="Example: Call when you reach the blue gate."
                    />
                    <p className="mt-1 text-right text-xs text-gray-400">
                      {deliveryNotes.length}/500
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <ShopLocationPicker
                      latitude={latitude}
                      longitude={longitude}
                      onChange={(nextLatitude, nextLongitude) => {
                        setLatitude(nextLatitude);
                        setLongitude(nextLongitude);
                        setError("");
                        setSuccess(
                          "Shop pin selected. Save your profile to keep it.",
                        );
                      }}
                      onError={(message) => {
                        setSuccess("");
                        setError(message);
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#f77f00] py-2 text-sm font-medium text-white hover:bg-[#d62828] disabled:cursor-not-allowed disabled:bg-gray-300 sm:col-span-2"
                  >
                    <Save size={16} />
                    {isSubmitting
                      ? "Saving..."
                      : profileExists
                        ? "Update Business Profile"
                        : "Complete Business Profile"}
                  </button>
                </form>

                <section className="mt-8 border-t pt-6">
                  <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="font-semibold text-[#003049]">
                        Shop Images
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Add up to five photos to help identify your shop.
                      </p>
                    </div>

                    <label
                      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#f77f00] px-3 py-2 text-sm font-medium text-[#f77f00] hover:bg-orange-50 ${
                        !profileExists ||
                        shopImages.length >= MAX_SHOP_IMAGES ||
                        isUploadingShopImages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                    >
                      <UploadCloud size={16} />
                      {isUploadingShopImages
                        ? "Uploading..."
                        : "Add shop images"}

                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={
                          !profileExists ||
                          shopImages.length >= MAX_SHOP_IMAGES ||
                          isUploadingShopImages
                        }
                        onChange={handleShopImages}
                      />
                    </label>
                  </div>

                  <p className="mb-3 text-xs text-gray-400">
                    {shopImages.length}/{MAX_SHOP_IMAGES} images uploaded
                  </p>

                  {shopImages.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed p-8 text-center text-sm text-gray-400">
                      <Building2 size={30} className="mx-auto mb-2" />
                      No shop images uploaded yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {shopImages.map((image) => {
                        const imageUrl = resolveCustomerImageUrl(
                          image.image_url,
                        );

                        return (
                          <div
                            key={image.shop_image_id}
                            className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-gray-100"
                          >
                            {imageUrl && (
                              <img
                                src={imageUrl}
                                alt="Shop"
                                className="h-full w-full object-cover"
                              />
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveShopImage(image.shop_image_id)
                              }
                              disabled={deletingImageId === image.shop_image_id}
                              className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-red-600 shadow hover:bg-white disabled:opacity-50"
                              aria-label="Remove shop image"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
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

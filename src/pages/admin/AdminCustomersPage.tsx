import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  ShieldX,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { adminNavItems } from "../../config/adminNav";
import { useAuth } from "../../context/AuthContext";
import {
  changeCustomerStatus,
  getCustomers,
  type CustomerProfile,
  type CustomerStatus,
  type CustomersResponse,
} from "../../services/customerService";
import ErrorState from "../../components/ui/ErrorState";
import { SkeletonTableRow } from "../../components/ui/Skeleton";

const PAGE_SIZE = 10;

export default function AdminCustomersPage() {
  const { token } = useAuth();

  const [result, setResult] = useState<CustomersResponse | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerStatus | "">("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCustomers = useCallback(async () => {
    if (!token) {
      setError("Your session is unavailable. Please log in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await getCustomers(token, {
        page,
        limit: PAGE_SIZE,
        search,
        status,
      });

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load customers.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, token]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function handleStatusChange(customer: CustomerProfile) {
    if (!token || updatingId !== null) {
      return;
    }

    const nextStatus: CustomerStatus =
      customer.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus === "SUSPENDED" ? "suspend" : "activate"
      } ${customer.business_name}?`,
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(customer.customer_id);
    setError("");
    setSuccess("");

    try {
      await changeCustomerStatus(token, customer.customer_id, nextStatus);

      setSuccess(
        `${customer.business_name} is now ${nextStatus.toLowerCase()}.`,
      );

      await loadCustomers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update customer status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const customers = result?.data ?? [];
  const pagination = result?.pagination;

  return (
    <DashboardLayout navItems={adminNavItems}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#003049]">Customers</h1>

        <p className="mt-1 text-sm text-gray-500">
          Search, review and manage registered retailer businesses.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Customers</p>
            <Users size={20} className="text-[#003049]" />
          </div>

          <p className="mt-2 text-2xl font-bold text-[#003049]">
            {pagination?.total ?? 0}
          </p>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Current Results</p>

          <p className="mt-2 text-2xl font-bold text-[#003049]">
            {customers.length}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 md:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm"
              placeholder="Search business, contact person or phone"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value as CustomerStatus | "");
            }}
            className="rounded-lg border bg-white px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-[#f77f00] px-5 py-2 text-sm font-medium text-white hover:bg-[#d62828]"
          >
            Search
          </button>
        </form>
      </div>

      {error && !isLoading && (
        <div className="mb-6">
          <ErrorState message={error} onRetry={() => void loadCustomers()} />
        </div>
      )}

      {success && (
        <p className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">
          {success}
        </p>
      )}

      {!error && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonTableRow key={index} columns={7} />
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No customers match the selected filters.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <CustomerRow
                      key={customer.customer_id}
                      customer={customer}
                      isUpdating={updatingId === customer.customer_id}
                      onStatusChange={() => void handleStatusChange(customer)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={pagination.page <= 1}
                  className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={17} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(pagination.totalPages, current + 1),
                    )
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

type CustomerRowProps = {
  customer: CustomerProfile;
  isUpdating: boolean;
  onStatusChange: () => void;
};

function CustomerRow({
  customer,
  isUpdating,
  onStatusChange,
}: CustomerRowProps) {
  const isActive = customer.status === "ACTIVE";

  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-[#003049]">
        {customer.business_name}
      </td>

      <td className="px-4 py-3 text-gray-600">{customer.contact_person}</td>

      <td className="px-4 py-3 text-gray-600">{customer.phone}</td>

      <td className="px-4 py-3 text-gray-600">{customer.user?.email ?? "—"}</td>

      <td className="px-4 py-3 text-gray-600">{customer.business_location}</td>

      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isActive ? "Active" : "Suspended"}
        </span>
      </td>

      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={onStatusChange}
          disabled={isUpdating}
          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
            isActive
              ? "border-red-200 text-red-600 hover:bg-red-50"
              : "border-green-200 text-green-600 hover:bg-green-50"
          }`}
        >
          {isActive ? <ShieldX size={14} /> : <ShieldCheck size={14} />}

          {isUpdating ? "Updating..." : isActive ? "Suspend" : "Activate"}
        </button>
      </td>
    </tr>
  );
}

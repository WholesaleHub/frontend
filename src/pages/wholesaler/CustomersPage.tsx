import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, RefreshCw, Search } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";
import { useAuth } from "../../context/AuthContext";
import {
  getCustomers,
  type CustomerListItem,
} from "../../services/customerService";
import ErrorState from "../../components/ui/ErrorState";
import { SkeletonTableRow } from "../../components/ui/Skeleton";

export default function CustomersPage() {
  const { token } = useAuth();

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setCustomers(await getCustomers(token));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load customers.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.business_name,
        customer.contact_person,
        customer.phone,
        customer.business_location,
        customer.user.email,
      ].some((value) => value.toLowerCase().includes(search)),
    );
  }, [customers, searchTerm]);

  return (
    <DashboardLayout navItems={wholesalerNavItems}>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#003049]">Customers</h1>

          <p className="mt-1 text-sm text-gray-500">
            {isLoading
              ? "Loading customers..."
              : `${customers.length} registered customer${
                  customers.length === 1 ? "" : "s"
                }`}
          </p>
        </div>

        <button
          type="button"
          onClick={loadCustomers}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#003049] hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={loadCustomers} />}

      {!error && (
        <>
          <div className="mb-4 rounded-lg bg-white p-4 shadow">
            <div className="relative max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search business, contact, phone or email..."
                className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:border-[#f77f00] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-500">
                    <th className="p-3">Business</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Orders</th>
                    <th className="p-3">Total Spent</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <SkeletonTableRow key={index} columns={7} />
                    ))
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No customers found.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr
                        key={customer.customer_id}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="p-3">
                          <Link
                            to={`/dashboard/wholesaler/customers/${customer.customer_id}`}
                            className="font-medium text-[#003049] hover:underline"
                          >
                            {customer.business_name}
                          </Link>

                          <p className="text-xs text-gray-400">
                            {customer.user.email}
                          </p>
                        </td>

                        <td className="p-3">
                          <p>{customer.contact_person}</p>
                          <p className="text-xs text-gray-400">
                            {customer.phone}
                          </p>
                        </td>

                        <td className="p-3 text-gray-600">
                          {customer.business_location}
                        </td>

                        <td className="p-3">{customer.orderCount}</td>

                        <td className="p-3 font-medium">
                          Ksh {customer.totalSpent.toLocaleString()}
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              customer.status.toUpperCase() === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {customer.status}
                          </span>
                        </td>

                        <td className="p-3">
                          <Link
                            to={`/dashboard/wholesaler/customers/${customer.customer_id}`}
                            className="inline-flex rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-[#003049]"
                            aria-label={`View ${customer.business_name}`}
                          >
                            <Eye size={17} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

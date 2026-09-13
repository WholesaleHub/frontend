import { Search, ShieldCheck, ShieldX, UserRoundCog } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { adminNavItems } from "../../config/adminNav";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ErrorState from "../../components/ui/ErrorState";
import { SkeletonTableRow } from "../../components/ui/Skeleton";
import {
  getUsers,
  updateUserStatus,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from "../../services/userService";

const dateFormatter = new Intl.DateTimeFormat("en-KE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [pendingUser, setPendingUser] = useState<AdminUser | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = useCallback(async () => {
    if (!token) {
      setLoadError("Your session is unavailable. Please log in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");

    try {
      setUsers(
        await getUsers(token, {
          search,
          role,
          status,
        }),
      );
    } catch (error) {
      setUsers([]);
      setLoadError(
        error instanceof Error ? error.message : "Failed to load users.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [role, search, status, token]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setActionError("");
    setSuccess("");
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setRole("");
    setStatus("");
    setActionError("");
    setSuccess("");
  }

  async function confirmStatusChange() {
    if (!pendingUser || !token || updatingId !== null) {
      return;
    }

    const selectedUser = pendingUser;
    const nextStatus: UserStatus =
      selectedUser.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setPendingUser(null);
    setUpdatingId(selectedUser.id);
    setActionError("");
    setSuccess("");

    try {
      const updatedUser = await updateUserStatus(
        token,
        selectedUser.id,
        nextStatus,
      );

      setUsers((current) => {
        if (status && updatedUser.status !== status) {
          return current.filter((item) => item.id !== updatedUser.id);
        }

        return current.map((item) =>
          item.id === updatedUser.id ? updatedUser : item,
        );
      });

      setSuccess(
        `${updatedUser.full_name} is now ${updatedUser.status.toLowerCase()}.`,
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to update user status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const hasActiveFilters = search !== "" || role !== "" || status !== "";
  const nextPendingStatus: UserStatus =
    pendingUser?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  return (
    <DashboardLayout navItems={adminNavItems}>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#003049]">User Management</h1>

        <p className="mt-1 text-sm text-gray-500">
          Search accounts and manage access across WholesaleHub.
        </p>
      </header>

      <section className="mb-6 rounded-lg bg-white p-4 shadow">
        <form
          onSubmit={handleSearch}
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]"
        >
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />

            <label htmlFor="user-search" className="sr-only">
              Search users
            </label>

            <input
              id="user-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or email"
              className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm"
            />
          </div>

          <label htmlFor="user-role" className="sr-only">
            Filter by role
          </label>

          <select
            id="user-role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole | "")}
            className="rounded-lg border bg-white px-3 py-2 text-sm"
          >
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="WHOLESALER">Wholesaler</option>
            <option value="RETAILER">Retailer</option>
          </select>

          <label htmlFor="user-status" className="sr-only">
            Filter by status
          </label>

          <select
            id="user-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as UserStatus | "")
            }
            className="rounded-lg border bg-white px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-[#f77f00] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#d62828] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Search
          </button>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters && !searchInput}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-[#003049] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear filters
          </button>
        </form>
      </section>

      {loadError && !isLoading && (
        <div className="mb-6">
          <ErrorState message={loadError} onRetry={() => void loadUsers()} />
        </div>
      )}

      {actionError && (
        <p
          className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700"
          role="alert"
        >
          {actionError}
        </p>
      )}

      {success && (
        <p
          className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700"
          role="status"
        >
          {success}
        </p>
      )}

      {!loadError && (
        <section className="overflow-hidden rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b px-4 py-4">
            <div>
              <h2 className="font-semibold text-[#003049]">System users</h2>
              <p className="mt-1 text-sm text-gray-500">
                {isLoading
                  ? "Loading accounts..."
                  : `${users.length} account${users.length === 1 ? "" : "s"}`}
              </p>
            </div>

            <UserRoundCog
              size={22}
              className="text-[#f77f00]"
              aria-hidden="true"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonTableRow key={index} columns={6} />
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No users match the selected filters.
                    </td>
                  </tr>
                ) : (
                  users.map((managedUser) => {
                    const isActive = managedUser.status === "ACTIVE";
                    const isCurrentUser = managedUser.id === currentUser?.id;

                    return (
                      <tr
                        key={managedUser.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#003049]">
                            {managedUser.full_name}
                            {isCurrentUser && (
                              <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {managedUser.email}
                          </p>
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {managedUser.phone || "—"}
                        </td>

                        <td className="px-4 py-3 capitalize text-gray-600">
                          {managedUser.role.toLowerCase()}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {dateFormatter.format(
                            new Date(managedUser.created_at),
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setPendingUser(managedUser)}
                            disabled={updatingId !== null}
                            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                              isActive
                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                : "border-green-200 text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {isActive ? (
                              <ShieldX size={14} />
                            ) : (
                              <ShieldCheck size={14} />
                            )}

                            {updatingId === managedUser.id
                              ? "Updating..."
                              : isActive
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <ConfirmDialog
        isOpen={pendingUser !== null}
        title={
          nextPendingStatus === "INACTIVE"
            ? "Deactivate user?"
            : "Activate user?"
        }
        message={
          pendingUser
            ? `${
                nextPendingStatus === "INACTIVE" ? "Deactivating" : "Activating"
              } ${pendingUser.full_name} will ${
                nextPendingStatus === "INACTIVE"
                  ? "prevent them from accessing WholesaleHub."
                  : "restore their access to WholesaleHub."
              }`
            : ""
        }
        confirmLabel={
          nextPendingStatus === "INACTIVE" ? "Deactivate" : "Activate"
        }
        danger={nextPendingStatus === "INACTIVE"}
        onCancel={() => setPendingUser(null)}
        onConfirm={() => void confirmStatusChange()}
      />
    </DashboardLayout>
  );
}

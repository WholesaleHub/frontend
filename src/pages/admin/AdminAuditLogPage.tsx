import { ChevronLeft, ChevronRight, FileClock } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { adminNavItems } from "../../config/adminNav";
import { useAuth } from "../../context/AuthContext";
import ErrorState from "../../components/ui/ErrorState";
import { SkeletonTableRow } from "../../components/ui/Skeleton";
import { getAuditLogs, type AuditResponse } from "../../services/auditService";
import { getUsers, type AdminUser } from "../../services/userService";

const PAGE_SIZE = 10;

const dateFormatter = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : dateFormatter.format(parsedDate);
}

export default function AdminAuditLogPage() {
  const { token } = useAuth();

  const [result, setResult] = useState<AuditResponse | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAuditData = useCallback(async () => {
    if (!token) {
      setError("Your session is unavailable. Please log in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [auditResponse, userData] = await Promise.all([
        getAuditLogs(token, {
          page,
          limit: PAGE_SIZE,
          action,
        }),
        getUsers(token),
      ]);

      setResult(auditResponse);
      setUsers(userData);
    } catch (loadError) {
      setResult(null);
      setUsers([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load audit logs.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [action, page, token]);

  useEffect(() => {
    void loadAuditData();
  }, [loadAuditData]);

  const usersById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  );

  const logs = result?.data ?? [];
  const pagination = result?.pagination;

  return (
    <DashboardLayout navItems={adminNavItems}>
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#003049]">Audit Log</h1>

          <p className="mt-1 text-sm text-gray-500">
            Review administrative actions recorded by WholesaleHub.
          </p>
        </div>

        <div>
          <label
            htmlFor="audit-action"
            className="mb-1 block text-sm font-medium text-gray-600"
          >
            Action
          </label>

          <select
            id="audit-action"
            value={action}
            onChange={(event) => {
              setPage(1);
              setAction(event.target.value);
            }}
            disabled={isLoading}
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm disabled:opacity-60 sm:w-auto"
          >
            <option value="">All actions</option>
            <option value="USER_STATUS_UPDATED">User status updated</option>
          </select>
        </div>
      </header>

      {error && !isLoading && (
        <ErrorState message={error} onRetry={() => void loadAuditData()} />
      )}

      {!error && (
        <section className="overflow-hidden rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b px-4 py-4">
            <div>
              <h2 className="font-semibold text-[#003049]">
                Recorded activity
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {isLoading
                  ? "Loading audit records..."
                  : `${pagination?.total ?? logs.length} total record${
                      (pagination?.total ?? logs.length) === 1 ? "" : "s"
                    }`}
              </p>
            </div>

            <FileClock
              size={22}
              className="text-[#f77f00]"
              aria-hidden="true"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Resource</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonTableRow key={index} columns={5} />
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No audit records match the selected action.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const actor = usersById.get(log.actor_id);

                    return (
                      <tr
                        key={log.audit_log_id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          {actor ? (
                            <>
                              <p className="font-medium text-[#003049]">
                                {actor.full_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {actor.email}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-[#003049]">
                                Unknown user
                              </p>
                              <p className="max-w-52 truncate text-xs text-gray-500">
                                {log.actor_id}
                              </p>
                            </>
                          )}
                        </td>

                        <td className="px-4 py-3 text-gray-700">
                          {formatLabel(log.action)}
                        </td>

                        <td className="px-4 py-3 text-gray-700">
                          {formatLabel(log.resource)}
                        </td>

                        <td className="max-w-64 truncate px-4 py-3 text-gray-500">
                          {log.target_id || "—"}
                        </td>

                        <td className="px-4 py-3 text-gray-500">
                          {formatDate(log.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <nav
              className="flex items-center justify-between border-t px-4 py-3"
              aria-label="Audit log pagination"
            >
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={pagination.page <= 1 || isLoading}
                  className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous audit page"
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
                  disabled={
                    pagination.page >= pagination.totalPages || isLoading
                  }
                  className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next audit page"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </nav>
          )}
        </section>
      )}
    </DashboardLayout>
  );
}

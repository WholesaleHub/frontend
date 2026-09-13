import type { ReactNode } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminAuditLogPage from "./AdminAuditLogPage";
import {
  getAuditLogs,
  type AuditLog,
  type AuditResponse,
} from "../../services/auditService";
import { getUsers, type AdminUser } from "../../services/userService";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    token: "admin-token",
    user: {
      id: "admin-1",
      fullName: "Current Admin",
      email: "admin@example.com",
      role: "ADMIN",
    },
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
  }),
}));

vi.mock("../../layouts/DashboardLayout", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("../../services/auditService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../services/auditService")>();

  return {
    ...actual,
    getAuditLogs: vi.fn(),
  };
});

vi.mock("../../services/userService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../services/userService")>();

  return {
    ...actual,
    getUsers: vi.fn(),
  };
});

const mockedGetAuditLogs = vi.mocked(getAuditLogs);
const mockedGetUsers = vi.mocked(getUsers);

const admin: AdminUser = {
  id: "admin-1",
  full_name: "Current Admin",
  email: "admin@example.com",
  phone: null,
  role: "ADMIN",
  status: "ACTIVE",
  created_at: "2026-09-01T08:00:00.000Z",
};

const auditLog: AuditLog = {
  audit_log_id: 15,
  actor_id: "admin-1",
  action: "USER_STATUS_UPDATED",
  resource: "USER",
  target_id: "retailer-1",
  metadata: {
    previousStatus: "ACTIVE",
    newStatus: "INACTIVE",
  },
  created_at: "2026-09-10T12:30:00.000Z",
};

function createResponse(overrides: Partial<AuditResponse> = {}): AuditResponse {
  return {
    data: [auditLog],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
    ...overrides,
  };
}

function renderPage() {
  return render(<AdminAuditLogPage />);
}

describe("AdminAuditLogPage", () => {
  beforeEach(() => {
    mockedGetAuditLogs.mockReset();
    mockedGetUsers.mockReset();

    mockedGetAuditLogs.mockResolvedValue(createResponse());
    mockedGetUsers.mockResolvedValue([admin]);
  });

  it("displays the actor, action, resource and timestamp", async () => {
    renderPage();

    const actorName = await screen.findByText("Current Admin");
    const auditRow = actorName.closest("tr");

    expect(auditRow).not.toBeNull();
    expect(
      within(auditRow!).getByText("admin@example.com"),
    ).toBeInTheDocument();
    expect(
      within(auditRow!).getByText("User Status Updated"),
    ).toBeInTheDocument();
    expect(within(auditRow!).getByText("User")).toBeInTheDocument();
    expect(within(auditRow!).getByText("retailer-1")).toBeInTheDocument();

    expect(mockedGetAuditLogs).toHaveBeenCalledWith("admin-token", {
      page: 1,
      limit: 10,
      action: "",
    });

    expect(mockedGetUsers).toHaveBeenCalledWith("admin-token");
  });

  it("filters logs by action", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Current Admin");

    await user.selectOptions(
      screen.getByLabelText("Action"),
      "USER_STATUS_UPDATED",
    );

    await waitFor(() => {
      expect(mockedGetAuditLogs).toHaveBeenLastCalledWith("admin-token", {
        page: 1,
        limit: 10,
        action: "USER_STATUS_UPDATED",
      });
    });
  });

  it("loads the next audit page", async () => {
    mockedGetAuditLogs
      .mockResolvedValueOnce(
        createResponse({
          pagination: {
            page: 1,
            limit: 10,
            total: 12,
            totalPages: 2,
          },
        }),
      )
      .mockResolvedValueOnce(
        createResponse({
          data: [
            {
              ...auditLog,
              audit_log_id: 16,
              target_id: "retailer-2",
            },
          ],
          pagination: {
            page: 2,
            limit: 10,
            total: 12,
            totalPages: 2,
          },
        }),
      );

    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Page 1 of 2");

    await user.click(
      screen.getByRole("button", {
        name: "Next audit page",
      }),
    );

    await waitFor(() => {
      expect(mockedGetAuditLogs).toHaveBeenLastCalledWith("admin-token", {
        page: 2,
        limit: 10,
        action: "",
      });
    });

    expect(await screen.findByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("retailer-2")).toBeInTheDocument();
  });

  it("displays an empty audit state", async () => {
    mockedGetAuditLogs.mockResolvedValue(
      createResponse({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      }),
    );

    renderPage();

    expect(
      await screen.findByText("No audit records match the selected action."),
    ).toBeInTheDocument();
  });

  it("displays an API error and allows retry", async () => {
    mockedGetAuditLogs
      .mockRejectedValueOnce(new Error("Audit service unavailable."))
      .mockResolvedValueOnce(
        createResponse({
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        }),
      );

    const user = userEvent.setup();
    renderPage();

    expect(
      await screen.findByText("Audit service unavailable."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try Again" }));

    await waitFor(() => {
      expect(mockedGetAuditLogs).toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByText("No audit records match the selected action."),
    ).toBeInTheDocument();
  });
});

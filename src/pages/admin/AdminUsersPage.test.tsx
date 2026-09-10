import type { ReactNode } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminUsersPage from "./AdminUsersPage";
import {
  getUsers,
  updateUserStatus,
  type AdminUser,
} from "../../services/userService";

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

vi.mock("../../services/userService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../services/userService")>();

  return {
    ...actual,
    getUsers: vi.fn(),
    updateUserStatus: vi.fn(),
  };
});

const mockedGetUsers = vi.mocked(getUsers);
const mockedUpdateUserStatus = vi.mocked(updateUserStatus);

const currentAdmin: AdminUser = {
  id: "admin-1",
  full_name: "Current Admin",
  email: "admin@example.com",
  phone: null,
  role: "ADMIN",
  status: "ACTIVE",
  created_at: "2026-09-01T08:00:00.000Z",
};

const retailer: AdminUser = {
  id: "retailer-1",
  full_name: "Jane Retailer",
  email: "jane@example.com",
  phone: "+254700000000",
  role: "RETAILER",
  status: "ACTIVE",
  created_at: "2026-09-02T08:00:00.000Z",
};

function renderPage() {
  return render(<AdminUsersPage />);
}

describe("AdminUsersPage", () => {
  beforeEach(() => {
    mockedGetUsers.mockReset();
    mockedUpdateUserStatus.mockReset();
    mockedGetUsers.mockResolvedValue([currentAdmin, retailer]);
  });

  it("loads users and identifies the current administrator", async () => {
    renderPage();

    expect(await screen.findByText("Jane Retailer")).toBeInTheDocument();
    expect(screen.getByText("Current Admin")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();

    expect(mockedGetUsers).toHaveBeenCalledWith("admin-token", {
      search: "",
      role: "",
      status: "",
    });
  });

  it("sends search, role and status filters together", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Jane Retailer");

    await user.selectOptions(
      screen.getByLabelText("Filter by role"),
      "RETAILER",
    );

    await user.selectOptions(
      screen.getByLabelText("Filter by status"),
      "ACTIVE",
    );

    await user.type(
      screen.getByRole("searchbox", { name: "Search users" }),
      "Jane",
    );

    await user.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(mockedGetUsers).toHaveBeenLastCalledWith("admin-token", {
        search: "Jane",
        role: "RETAILER",
        status: "ACTIVE",
      });
    });
  });

  it("confirms and applies a sensitive status change", async () => {
    mockedUpdateUserStatus.mockResolvedValue({
      ...retailer,
      status: "INACTIVE",
    });

    const user = userEvent.setup();
    renderPage();

    const retailerName = await screen.findByText("Jane Retailer");
    const retailerRow = retailerName.closest("tr");

    expect(retailerRow).not.toBeNull();

    await user.click(
      within(retailerRow!).getByRole("button", {
        name: "Deactivate",
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Deactivate user?" }),
    ).toBeInTheDocument();

    const confirmationButtons = screen.getAllByRole("button", {
      name: "Deactivate",
    });

    await user.click(confirmationButtons[confirmationButtons.length - 1]);

    await waitFor(() => {
      expect(mockedUpdateUserStatus).toHaveBeenCalledWith(
        "admin-token",
        "retailer-1",
        "INACTIVE",
      );
    });

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Jane Retailer is now inactive.",
    );

    expect(within(retailerRow!).getByText("Inactive")).toBeInTheDocument();
  });

  it("displays an empty state when no users match", async () => {
    mockedGetUsers.mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByText("No users match the selected filters."),
    ).toBeInTheDocument();
  });

  it("displays an API error and supports retry", async () => {
    mockedGetUsers
      .mockRejectedValueOnce(new Error("Unable to load user accounts."))
      .mockResolvedValueOnce([]);

    const user = userEvent.setup();
    renderPage();

    expect(
      await screen.findByText("Unable to load user accounts."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try Again" }));

    await waitFor(() => {
      expect(mockedGetUsers).toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByText("No users match the selected filters."),
    ).toBeInTheDocument();
  });
});

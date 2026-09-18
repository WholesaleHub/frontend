import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import ForbiddenPage from "../pages/ForbiddenPage";

const { mockedUseAuth } = vi.hoisted(() => ({
  mockedUseAuth: vi.fn(),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockedUseAuth(),
}));

function LoginDestination() {
  const location = useLocation();
  const state = location.state as
    { from?: string; reason?: string } | undefined;

  return (
    <div>
      <p>Login destination</p>
      <p>Requested location: {state?.from}</p>
      <p>Reason: {state?.reason}</p>
    </div>
  );
}

function renderProtectedRoute(initialEntry = "/protected?tab=orders") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <p>Protected content</p>
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<LoginDestination />} />
        <Route path="/forbidden" element={<p>Forbidden destination</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  it("redirects unauthenticated users and preserves the requested URL", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      expireSession: vi.fn(),
      sessionExpired: false,
    });

    renderProtectedRoute();

    expect(screen.getByText("Login destination")).toBeInTheDocument();
    expect(
      screen.getByText("Requested location: /protected?tab=orders"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Reason: authentication-required"),
    ).toBeInTheDocument();
  });

  it("redirects a signed-in user with the wrong role to forbidden", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "retailer-1",
        fullName: "Retailer User",
        email: "retailer@example.com",
        role: "RETAILER",
      },
      token: "valid-token",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      expireSession: vi.fn(),
      sessionExpired: false,
    });

    renderProtectedRoute();

    expect(screen.getByText("Forbidden destination")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("identifies an expired session during the login redirect", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      sessionExpired: true,
      login: vi.fn(),
      logout: vi.fn(),
      expireSession: vi.fn(),
    });

    renderProtectedRoute();

    expect(screen.getByText("Login destination")).toBeInTheDocument();
    expect(
      screen.getByText("Requested location: /protected?tab=orders"),
    ).toBeInTheDocument();
    expect(screen.getByText("Reason: session-expired")).toBeInTheDocument();
  });

  it("renders protected content for an allowed role", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "admin-1",
        fullName: "Admin User",
        email: "admin@example.com",
        role: "ADMIN",
      },
      token: "valid-token",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      expireSession: vi.fn(),
      sessionExpired: false,
    });

    renderProtectedRoute();

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("links a forbidden user back to their role dashboard", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "retailer-1",
        fullName: "Retailer User",
        email: "retailer@example.com",
        role: "RETAILER",
      },
      token: "valid-token",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      expireSession: vi.fn(),
      sessionExpired: false,
    });

    render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: "Return to dashboard" }),
    ).toHaveAttribute("href", "/dashboard/retailer");
  });
});

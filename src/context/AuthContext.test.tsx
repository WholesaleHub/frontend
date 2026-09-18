import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { SESSION_EXPIRED_EVENT } from "../utils/authEvents";
const STORAGE_KEY = "wholesalehub_auth";

const user = {
  id: "retailer-1",
  fullName: "Retailer User",
  email: "retailer@example.com",
  role: "RETAILER",
};

function createToken(expirationTime: number): string {
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      exp: expirationTime,
    }),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `header.${payload}.signature`;
}

function AuthState() {
  const {
    user: authenticatedUser,
    isAuthenticated,
    sessionExpired,
  } = useAuth();

  return (
    <div>
      <p>
        Authentication: {isAuthenticated ? "authenticated" : "unauthenticated"}
      </p>
      <p>User: {authenticatedUser?.email ?? "none"}</p>
      <p>Session: {sessionExpired ? "expired" : "current"}</p>
    </div>
  );
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <AuthState />
    </AuthProvider>,
  );
}

describe("AuthContext session expiration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("restores a stored session when its token is still valid", () => {
    const token = createToken(Math.floor(Date.now() / 1000) + 60 * 60);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user,
        token,
      }),
    );

    renderAuthProvider();

    expect(
      screen.getByText("Authentication: authenticated"),
    ).toBeInTheDocument();
    expect(screen.getByText("User: retailer@example.com")).toBeInTheDocument();
    expect(screen.getByText("Session: current")).toBeInTheDocument();
  });

  it("removes an expired session during application startup", () => {
    const token = createToken(Math.floor(Date.now() / 1000) - 60);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user,
        token,
      }),
    );

    renderAuthProvider();

    expect(
      screen.getByText("Authentication: unauthenticated"),
    ).toBeInTheDocument();
    expect(screen.getByText("User: none")).toBeInTheDocument();
    expect(screen.getByText("Session: expired")).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("ends an active session after its token expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T18:00:00.000Z"));

    const token = createToken(Math.floor(Date.now() / 1000) + 10);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user,
        token,
      }),
    );

    renderAuthProvider();

    expect(
      screen.getByText("Authentication: authenticated"),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(
      screen.getByText("Authentication: unauthenticated"),
    ).toBeInTheDocument();
    expect(screen.getByText("Session: expired")).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("ends an authenticated session immediately after a backend 401 event", () => {
    const token = createToken(Math.floor(Date.now() / 1000) + 60 * 60);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user,
        token,
      }),
    );

    renderAuthProvider();

    expect(
      screen.getByText("Authentication: authenticated"),
    ).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    });

    expect(
      screen.getByText("Authentication: unauthenticated"),
    ).toBeInTheDocument();
    expect(screen.getByText("Session: expired")).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

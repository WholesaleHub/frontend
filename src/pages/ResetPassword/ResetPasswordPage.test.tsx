import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ResetPasswordPage from "./ResetPasswordPage";
import { resetPassword } from "../../services/authService";

vi.mock("../../services/authService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../services/authService")>();

  return {
    ...actual,
    resetPassword: vi.fn(),
  };
});

const mockedResetPassword = vi.mocked(resetPassword);

function renderPage(path = "/reset-password?token=valid-token") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<p>Login destination</p>} />
        <Route
          path="/forgot-password"
          element={<p>Forgot password destination</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    mockedResetPassword.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("displays a clear message when the reset token is missing", () => {
    renderPage("/reset-password");

    expect(
      screen.getByRole("heading", { name: "Reset link unavailable" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toHaveTextContent(
      /missing its token or is no longer valid/i,
    );

    expect(
      screen.getByRole("link", { name: "Request a new link" }),
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("prevents submission when the password is not strong enough", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("New password"), "weak");

    await user.type(screen.getByLabelText("Confirm new password"), "weak");

    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(
      screen.getByText("Password does not meet all requirements."),
    ).toBeInTheDocument();

    expect(mockedResetPassword).not.toHaveBeenCalled();
  });

  it("resets the password, shows success and redirects to login", async () => {
    mockedResetPassword.mockResolvedValue({
      message: "Password reset successfully",
    });

    const user = userEvent.setup();

    renderPage();

    await user.type(screen.getByLabelText("New password"), "Secure1!");

    await user.type(screen.getByLabelText("Confirm new password"), "Secure1!");

    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Password reset successfully",
    );

    expect(mockedResetPassword).toHaveBeenCalledWith("valid-token", "Secure1!");

    expect(
      await screen.findByText("Login destination", {}, { timeout: 2500 }),
    ).toBeInTheDocument();
  });

  it("shows a clear expired-link message returned by the API", async () => {
    mockedResetPassword.mockRejectedValue(
      new Error("Invalid or expired password reset token"),
    );

    const user = userEvent.setup();
    renderPage("/reset-password?token=expired-token");

    await user.type(screen.getByLabelText("New password"), "Secure1!");

    await user.type(screen.getByLabelText("Confirm new password"), "Secure1!");

    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This password-reset link is invalid or has expired.",
    );

    expect(
      screen.getByRole("link", {
        name: "Request another reset link",
      }),
    ).toHaveAttribute("href", "/forgot-password");
  });
});

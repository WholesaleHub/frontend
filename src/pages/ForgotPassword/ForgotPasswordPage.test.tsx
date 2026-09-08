import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPasswordPage from "./ForgotPasswordPage";
import { requestPasswordReset } from "../../services/authService";

vi.mock("../../services/authService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../services/authService")>();

  return {
    ...actual,
    requestPasswordReset: vi.fn(),
  };
});

const mockedRequestPasswordReset = vi.mocked(requestPasswordReset);

function renderPage() {
  return render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>,
  );
}

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    mockedRequestPasswordReset.mockReset();
  });

  it("validates the email address before submitting", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByRole("textbox", { name: "Email address" }),
      "invalid-email",
    );

    await user.click(
      screen.getByRole("button", { name: "Request reset link" }),
    );

    expect(
      screen.getByText("Please enter a valid email address."),
    ).toBeInTheDocument();

    expect(mockedRequestPasswordReset).not.toHaveBeenCalled();
  });

  it("requests a reset and provides the temporary development link", async () => {
    mockedRequestPasswordReset.mockResolvedValue({
      message:
        "If an account with that email exists, a password reset link has been generated.",
      resetToken: "reset-token-123",
    });

    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByRole("textbox", { name: "Email address" }),
      "  retailer@example.com  ",
    );

    await user.click(
      screen.getByRole("button", { name: "Request reset link" }),
    );

    expect(mockedRequestPasswordReset).toHaveBeenCalledWith(
      "retailer@example.com",
    );

    expect(
      await screen.findByText(/If an account with that email exists/),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Continue to reset password" }),
    ).toHaveAttribute("href", "/reset-password?token=reset-token-123");
  });

  it("shows email instructions when the API does not expose a token", async () => {
    mockedRequestPasswordReset.mockResolvedValue({
      message:
        "If an account with that email exists, a password reset link has been generated.",
    });

    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByRole("textbox", { name: "Email address" }),
      "retailer@example.com",
    );

    await user.click(
      screen.getByRole("button", { name: "Request reset link" }),
    );

    expect(
      await screen.findByText(/Check your email for the reset link/),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "Continue to reset password" }),
    ).not.toBeInTheDocument();
  });

  it("displays a meaningful API error", async () => {
    mockedRequestPasswordReset.mockRejectedValue(
      new Error("Password reset service is unavailable."),
    );

    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByRole("textbox", { name: "Email address" }),
      "retailer@example.com",
    );

    await user.click(
      screen.getByRole("button", { name: "Request reset link" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Password reset service is unavailable.",
    );
  });
});

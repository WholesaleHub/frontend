import { StrictMode } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VerifyEmailPage from "./VerifyEmailPage";
import { verifyEmail } from "../../services/authService";

vi.mock("../../services/authService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../services/authService")>();

  return {
    ...actual,
    verifyEmail: vi.fn(),
  };
});

const mockedVerifyEmail = vi.mocked(verifyEmail);

function renderPage(
  path = "/verify-email?token=verification-token",
  strict = false,
) {
  const page = (
    <MemoryRouter initialEntries={[path]}>
      <VerifyEmailPage />
    </MemoryRouter>
  );

  return render(strict ? <StrictMode>{page}</StrictMode> : page);
}

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    mockedVerifyEmail.mockReset();
  });

  it("verifies the token once and displays the success state", async () => {
    mockedVerifyEmail.mockResolvedValue({
      message: "Email verified successfully",
    });

    renderPage("/verify-email?token=verification-token", true);

    expect(
      await screen.findByRole("heading", { name: "Email verified" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Email verified successfully",
    );

    await waitFor(() => {
      expect(mockedVerifyEmail).toHaveBeenCalledTimes(1);
    });

    expect(mockedVerifyEmail).toHaveBeenCalledWith("verification-token");

    expect(
      screen.getByRole("link", { name: "Continue to sign in" }),
    ).toHaveAttribute("href", "/login");
  });

  it("shows a clear message for an invalid or expired token", async () => {
    mockedVerifyEmail.mockRejectedValue(
      new Error("Invalid or expired verification token"),
    );

    renderPage("/verify-email?token=expired-token");

    expect(
      await screen.findByRole("heading", {
        name: "Verification failed",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This verification link is invalid or has expired.",
    );

    expect(mockedVerifyEmail).toHaveBeenCalledWith("expired-token");
  });

  it("does not call the API when the verification token is missing", () => {
    renderPage("/verify-email");

    expect(
      screen.getByRole("heading", {
        name: "Verification link unavailable",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Verification token missing.",
    );

    expect(mockedVerifyEmail).not.toHaveBeenCalled();
  });
});

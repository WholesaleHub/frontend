import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} from "./authService";

const mockedFetch = vi.fn<typeof fetch>();

function jsonResponse(data: unknown, ok = true): Response {
  return {
    ok,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe("account recovery auth service", () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    vi.stubGlobal("fetch", mockedFetch);
  });

  it("requests a password reset using the email address", async () => {
    mockedFetch.mockResolvedValue(
      jsonResponse({
        message: "Reset link generated.",
        resetToken: "reset-token",
      }),
    );

    await expect(requestPasswordReset("retailer@example.com")).resolves.toEqual(
      {
        message: "Reset link generated.",
        resetToken: "reset-token",
      },
    );

    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/forgot-password"),
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "retailer@example.com",
        }),
      }),
    );
  });

  it("submits the token and new password to the reset endpoint", async () => {
    mockedFetch.mockResolvedValue(
      jsonResponse({
        message: "Password reset successfully",
      }),
    );

    await expect(resetPassword("reset-token", "Secure1!")).resolves.toEqual({
      message: "Password reset successfully",
    });

    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/reset-password"),
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: "reset-token",
          newPassword: "Secure1!",
        }),
      }),
    );
  });

  it("submits the verification token to the email endpoint", async () => {
    mockedFetch.mockResolvedValue(
      jsonResponse({
        message: "Email verified successfully",
      }),
    );

    await expect(verifyEmail("verification-token")).resolves.toEqual({
      message: "Email verified successfully",
    });

    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/verify-email"),
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: "verification-token",
        }),
      }),
    );
  });

  it("preserves expired-token errors returned by the backend", async () => {
    mockedFetch.mockResolvedValue(
      jsonResponse(
        {
          message: "Invalid or expired password reset token",
        },
        false,
      ),
    );

    await expect(resetPassword("expired-token", "Secure1!")).rejects.toThrow(
      "Invalid or expired password reset token",
    );
  });
});

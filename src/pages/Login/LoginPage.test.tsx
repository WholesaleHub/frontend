import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./LoginPage";
import { loginUser, resendVerification } from "../../services/authService";

const { mockedLogin } = vi.hoisted(() => ({
  mockedLogin: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockedLogin,
  }),
}));

vi.mock("../../services/authService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../services/authService")>();

  return {
    ...actual,
    loginUser: vi.fn(),
    resendVerification: vi.fn(),
  };
});

const mockedLoginUser = vi.mocked(loginUser);
const mockedResendVerification = vi.mocked(resendVerification);

function VerificationDestination() {
  const location = useLocation();

  return (
    <p>
      Verification destination: {location.pathname}
      {location.search}
    </p>
  );
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerificationDestination />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function submitLogin() {
  const user = userEvent.setup();

  await user.type(
    screen.getByPlaceholderText("you@example.com"),
    "retailer@example.com",
  );

  await user.type(screen.getByPlaceholderText("••••••••"), "Secure1!");
  await user.click(screen.getByRole("button", { name: "Sign In" }));

  return user;
}

describe("LoginPage verification recovery", () => {
  beforeEach(() => {
    mockedLogin.mockReset();
    mockedLoginUser.mockReset();
    mockedResendVerification.mockReset();
  });

  it("offers verification resend after an unverified login error", async () => {
    mockedLoginUser.mockRejectedValue(
      new Error("Please verify your email before logging in"),
    );

    renderPage();
    await submitLogin();

    expect(
      await screen.findByText("Please verify your email before logging in"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Resend verification" }),
    ).toBeInTheDocument();
  });

  it("does not offer verification resend for unrelated login errors", async () => {
    mockedLoginUser.mockRejectedValue(new Error("Invalid email or password"));

    renderPage();
    await submitLogin();

    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Resend verification" }),
    ).not.toBeInTheDocument();
  });

  it("resends verification and redirects when the API returns a token", async () => {
    mockedLoginUser.mockRejectedValue(
      new Error("Please verify your email before logging in"),
    );

    mockedResendVerification.mockResolvedValue({
      message: "Verification link generated.",
      verificationToken: "verification token/123",
    });

    renderPage();
    const user = await submitLogin();

    await user.click(
      await screen.findByRole("button", {
        name: "Resend verification",
      }),
    );

    expect(mockedResendVerification).toHaveBeenCalledWith(
      "retailer@example.com",
    );

    expect(
      await screen.findByText(
        "Verification destination: /verify-email?token=verification%20token%2F123",
      ),
    ).toBeInTheDocument();
  });

  it("shows check-email instructions when no token is exposed", async () => {
    mockedLoginUser.mockRejectedValue(
      new Error("Please verify your email before logging in"),
    );

    mockedResendVerification.mockResolvedValue({
      message:
        "If an unverified account with that email exists, a verification link has been generated.",
    });

    renderPage();
    const user = await submitLogin();

    await user.click(
      await screen.findByRole("button", {
        name: "Resend verification",
      }),
    );

    expect(
      await screen.findByText(
        "If an unverified account with that email exists, a verification link has been generated.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/Verification destination/),
    ).not.toBeInTheDocument();
  });

  it("displays errors returned by the resend request", async () => {
    mockedLoginUser.mockRejectedValue(
      new Error("Please verify your email before logging in"),
    );

    mockedResendVerification.mockRejectedValue(
      new Error("Unable to generate another verification link"),
    );

    renderPage();
    const user = await submitLogin();

    await user.click(
      await screen.findByRole("button", {
        name: "Resend verification",
      }),
    );

    expect(
      await screen.findByText("Unable to generate another verification link"),
    ).toBeInTheDocument();
  });
});

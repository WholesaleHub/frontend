import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "./RegisterPage";
import { registerUser } from "../../services/authService";

vi.mock("../../services/authService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../services/authService")>();

  return {
    ...actual,
    registerUser: vi.fn(),
  };
});

const mockedRegisterUser = vi.mocked(registerUser);

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
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerificationDestination />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function completeRegistrationForm() {
  const user = userEvent.setup();

  await user.type(screen.getByPlaceholderText("John Doe"), "Jane Retailer");

  await user.type(
    screen.getByPlaceholderText("you@example.com"),
    "jane@example.com",
  );

  const passwordInputs = screen.getAllByPlaceholderText("••••••••");

  await user.type(passwordInputs[0], "Secure1!");
  await user.type(passwordInputs[1], "Secure1!");

  await user.click(screen.getByRole("checkbox"));

  return user;
}

describe("RegisterPage verification flow", () => {
  beforeEach(() => {
    mockedRegisterUser.mockReset();
  });

  it("redirects a newly registered user to verify the returned token", async () => {
    mockedRegisterUser.mockResolvedValue({
      message: "User registered successfully",
      verificationToken: "verification token/123",
      user: {
        id: "user-1",
        fullName: "Jane Retailer",
        email: "jane@example.com",
        phone: null,
        role: "RETAILER",
        status: "ACTIVE",
      },
    });

    renderPage();
    const user = await completeRegistrationForm();

    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(mockedRegisterUser).toHaveBeenCalledWith({
      fullName: "Jane Retailer",
      email: "jane@example.com",
      password: "Secure1!",
      phone: undefined,
      role: "RETAILER",
    });

    expect(
      await screen.findByText(
        "Verification destination: /verify-email?token=verification%20token%2F123",
      ),
    ).toBeInTheDocument();
  });

  it("shows check-email instructions when registration returns no token", async () => {
    mockedRegisterUser.mockResolvedValue({
      message: "User registered successfully",
      user: {
        id: "user-1",
        fullName: "Jane Retailer",
        email: "jane@example.com",
        phone: null,
        role: "RETAILER",
        status: "ACTIVE",
      },
    });

    renderPage();
    const user = await completeRegistrationForm();

    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(
      await screen.findByText(
        "Account created successfully. Check your email for the verification link before signing in.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/Verification destination/),
    ).not.toBeInTheDocument();
  });
});

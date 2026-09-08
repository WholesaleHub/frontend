import { useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import logo from "../../assets/logo.svg";

const PASSWORD_RULES = [
  {
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: "One lowercase letter",
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    label: "One number",
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    label: "One special character (!@#$%^&*)",
    test: (password: string) => /[!@#$%^&*]/.test(password),
  },
];

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token")?.trim() ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const failedPasswordRules = PASSWORD_RULES.filter(
    (rule) => !rule.test(password),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !token) {
      return;
    }

    setPasswordError("");
    setConfirmPasswordError("");
    setServerError("");

    let isValid = true;

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (failedPasswordRules.length > 0) {
      setPasswordError("Password does not meet all requirements.");
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword(token, password);
      setSuccessMessage(`${response.message}. Redirecting you to sign in...`);
      setPassword("");
      setConfirmPassword("");

      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to reset your password.";

      setServerError(
        message.toLowerCase().includes("expired") ||
          message.toLowerCase().includes("invalid")
          ? "This password-reset link is invalid or has expired. Request a new link."
          : message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#003049] px-4 py-8">
        <section className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-md sm:p-8">
          <KeyRound size={38} className="mx-auto mb-3 text-[#f77f00]" />

          <h1 className="text-2xl font-bold text-[#003049]">
            Reset link unavailable
          </h1>

          <p className="mt-3 text-sm text-gray-600" role="alert">
            This password-reset link is missing its token or is no longer valid.
          </p>

          <Link
            to="/forgot-password"
            className="mt-6 inline-flex rounded bg-[#f77f00] px-4 py-2 font-semibold text-white transition hover:bg-[#d62828]"
          >
            Request a new link
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#003049] px-4 py-8">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-white"
        aria-label="Go to WholesaleHub registration"
      >
        <img src={logo} alt="" className="h-10 w-10" />
        <span className="text-lg font-bold">WholesaleHub</span>
      </Link>

      <div className="flex justify-center">
        <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-md sm:p-8">
          <KeyRound size={38} className="mx-auto mb-3 text-[#f77f00]" />

          <h1 className="text-center text-2xl font-bold text-[#003049]">
            Create a new password
          </h1>

          <p className="mb-6 mt-2 text-center text-sm text-gray-500">
            Choose a secure password for your WholesaleHub account.
          </p>

          {serverError && (
            <div
              className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700"
              role="alert"
            >
              <p>{serverError}</p>

              <Link
                to="/forgot-password"
                className="mt-2 inline-block font-semibold underline"
              >
                Request another reset link
              </Link>
            </div>
          )}

          {successMessage ? (
            <div className="space-y-4 text-center">
              <p
                className="rounded bg-green-100 p-3 text-sm text-green-700"
                role="status"
              >
                {successMessage}
              </p>

              <Link
                to="/login"
                className="inline-flex font-semibold text-[#f77f00] hover:underline"
              >
                Continue to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1 block text-sm font-medium"
                >
                  New password
                </label>

                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setPasswordError("");
                    }}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    className={`w-full rounded border p-2 pr-10 outline-none focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 ${
                      passwordError ? "border-red-500" : "border-gray-300"
                    }`}
                    aria-invalid={Boolean(passwordError)}
                    aria-describedby="new-password-requirements"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={isSubmitting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 disabled:opacity-50"
                    aria-label={
                      showPassword ? "Hide new password" : "Show new password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <ul id="new-password-requirements" className="mt-2 space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password);

                    return (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-1 text-xs ${
                          passed ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        <span aria-hidden="true">{passed ? "✓" : "○"}</span>
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>

                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirm-new-password"
                  className="mb-1 block text-sm font-medium"
                >
                  Confirm new password
                </label>

                <div className="relative">
                  <input
                    id="confirm-new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setConfirmPasswordError("");
                    }}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    className={`w-full rounded border p-2 pr-10 outline-none focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 ${
                      confirmPasswordError
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    aria-invalid={Boolean(confirmPasswordError)}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    disabled={isSubmitting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 disabled:opacity-50"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {confirmPasswordError && (
                  <p className="mt-1 text-sm text-red-600">
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded bg-[#f77f00] px-4 py-2 font-semibold text-white transition hover:bg-[#d62828] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSubmitting ? "Resetting password..." : "Reset password"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

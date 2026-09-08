import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import {
  requestPasswordReset,
  type ForgotPasswordResponse,
} from "../../services/authService";
import logo from "../../assets/logo.svg";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [serverError, setServerError] = useState("");
  const [result, setResult] = useState<ForgotPasswordResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setEmailError("");
    setServerError("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setEmailError("Email address is required.");
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      setResult(await requestPasswordReset(normalizedEmail));
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Unable to request a password reset.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <Mail size={38} className="mx-auto mb-3 text-[#f77f00]" />

          <h1 className="text-center text-2xl font-bold text-[#003049]">
            Forgot your password?
          </h1>

          <p className="mb-6 mt-2 text-center text-sm text-gray-500">
            Enter your account email to request a password-reset link.
          </p>

          {serverError && (
            <p
              className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700"
              role="alert"
            >
              {serverError}
            </p>
          )}

          {result ? (
            <div className="space-y-4">
              <p
                className="rounded bg-green-100 p-3 text-sm text-green-700"
                role="status"
              >
                {result.message}
              </p>

              {result.resetToken && (
                <Link
                  to={`/reset-password?token=${encodeURIComponent(
                    result.resetToken,
                  )}`}
                  className="block w-full rounded bg-[#f77f00] px-4 py-2 text-center font-semibold text-white transition hover:bg-[#d62828]"
                >
                  Continue to reset password
                </Link>
              )}

              {!result.resetToken && (
                <p className="text-center text-sm text-gray-500">
                  Check your email for the reset link. It expires after 30
                  minutes.
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="forgot-password-email"
                  className="mb-1 block text-sm font-medium"
                >
                  Email address
                </label>

                <input
                  id="forgot-password-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setEmailError("");
                  }}
                  autoComplete="email"
                  disabled={isSubmitting}
                  className={`w-full rounded border p-2 outline-none focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 ${
                    emailError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={
                    emailError ? "forgot-password-email-error" : undefined
                  }
                />

                {emailError && (
                  <p
                    id="forgot-password-email-error"
                    className="mt-1 text-sm text-red-600"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded bg-[#f77f00] px-4 py-2 font-semibold text-white transition hover:bg-[#d62828] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSubmitting ? "Requesting reset..." : "Request reset link"}
              </button>
            </form>
          )}

          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#003049] hover:text-[#f77f00]"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </Link>
        </section>
      </div>
    </main>
  );
}

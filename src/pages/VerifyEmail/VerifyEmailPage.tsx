import { useEffect, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, MailWarning } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../../services/authService";
import logo from "../../assets/logo.svg";

type VerificationStatus = "loading" | "success" | "error" | "missing";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const hasRequestedVerification = useRef(false);

  const [status, setStatus] = useState<VerificationStatus>(
    token ? "loading" : "missing",
  );
  const [message, setMessage] = useState(
    token ? "Verifying your email address..." : "Verification token missing.",
  );

  useEffect(() => {
    if (!token || hasRequestedVerification.current) {
      return;
    }

    hasRequestedVerification.current = true;

    async function submitVerification() {
      try {
        const response = await verifyEmail(token);
        setMessage(response.message);
        setStatus("success");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to verify your email address.";

        setMessage(
          errorMessage.toLowerCase().includes("expired") ||
            errorMessage.toLowerCase().includes("invalid")
            ? "This verification link is invalid or has expired."
            : errorMessage,
        );
        setStatus("error");
      }
    }

    void submitVerification();
  }, [token]);

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
        <section
          className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-md sm:p-8"
          aria-live="polite"
        >
          {status === "loading" && (
            <LoaderCircle
              size={42}
              className="mx-auto mb-4 animate-spin text-[#f77f00]"
              aria-hidden="true"
            />
          )}

          {status === "success" && (
            <CheckCircle2
              size={42}
              className="mx-auto mb-4 text-green-600"
              aria-hidden="true"
            />
          )}

          {(status === "error" || status === "missing") && (
            <MailWarning
              size={42}
              className="mx-auto mb-4 text-red-600"
              aria-hidden="true"
            />
          )}

          <h1 className="text-2xl font-bold text-[#003049]">
            {status === "loading" && "Verifying email"}
            {status === "success" && "Email verified"}
            {status === "error" && "Verification failed"}
            {status === "missing" && "Verification link unavailable"}
          </h1>

          <p
            className={`mt-3 text-sm ${
              status === "error" || status === "missing"
                ? "text-red-700"
                : "text-gray-600"
            }`}
            role={
              status === "error" || status === "missing" ? "alert" : "status"
            }
          >
            {message}
          </p>

          {status === "success" && (
            <Link
              to="/login"
              className="mt-6 inline-flex rounded bg-[#f77f00] px-4 py-2 font-semibold text-white transition hover:bg-[#d62828]"
            >
              Continue to sign in
            </Link>
          )}

          {(status === "error" || status === "missing") && (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-gray-500">
                Request a new verification link or contact support if the
                problem continues.
              </p>

              <Link
                to="/login"
                className="inline-flex font-semibold text-[#f77f00] hover:underline"
              >
                Return to sign in
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

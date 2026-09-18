import { ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ForbiddenPage() {
  const { user } = useAuth();
  const dashboardPath = user
    ? `/dashboard/${user.role.toLowerCase()}`
    : "/login";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow">
        <ShieldX
          size={48}
          className="mx-auto mb-4 text-[#d62828]"
          aria-hidden="true"
        />

        <h1 className="mb-2 text-2xl font-bold text-[#003049]">
          Access denied
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          You are signed in, but your account does not have permission to view
          this page.
        </p>

        <Link
          to={dashboardPath}
          className="inline-flex rounded-lg bg-[#f77f00] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#d62828]"
        >
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}

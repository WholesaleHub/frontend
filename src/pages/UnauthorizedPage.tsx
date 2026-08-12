import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const homePath =
    user?.role.toLowerCase() === "wholesaler"
      ? "/dashboard/wholesaler"
      : user?.role.toLowerCase() === "admin"
        ? "/dashboard/admin"
        : "/dashboard/retailer";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow p-10 text-center max-w-md">
        <ShieldAlert size={48} className="mx-auto text-[#d62828] mb-4" />
        <h1 className="text-xl font-bold text-[#003049] mb-2">Access Denied</h1>
        <p className="text-gray-500 text-sm mb-6">
          You don't have permission to view that page with your current account
          role.
        </p>
        <Link
          to={homePath}
          className="bg-[#003049] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#00253b]"
        >
          Go to My Dashboard
        </Link>
      </div>
    </div>
  );
}

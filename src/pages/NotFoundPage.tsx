import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow p-10 text-center max-w-md">
        <FileQuestion size={48} className="mx-auto text-[#f77f00] mb-4" />
        <h1 className="text-xl font-bold text-[#003049] mb-2">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-6">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#f77f00] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d62828] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

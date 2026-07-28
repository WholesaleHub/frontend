import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ErrorModalProps = {
  message?: string;
  homePath: string;
};

export default function ErrorModal({
  message = "We encountered an unexpected error. Please try again later.",
  homePath,
}: ErrorModalProps) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-[#d62828]" />
        </div>
        <h2 className="font-semibold text-[#003049] text-lg mb-1">Something went wrong!</h2>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <button
          onClick={() => navigate(homePath)}
          className="bg-[#003049] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#002038]"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
}


import { AlertTriangle, RefreshCw } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export default function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-white rounded-lg shadow p-10 text-center">
      <AlertTriangle size={40} className="mx-auto text-[#d62828] mb-3" />
      <h2 className="text-lg font-semibold text-[#003049] mb-1">{title}</h2>
      <p className="text-gray-500 text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-[#f77f00] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d62828] transition-colors"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
}

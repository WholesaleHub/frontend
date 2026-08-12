import { Check, X } from "lucide-react";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const TRACK_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
] as const;

type OrderStatusTrackerProps = {
  status: string;
};

export default function OrderStatusTracker({
  status,
}: OrderStatusTrackerProps) {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-[#d62828]">
        <X size={18} />

        <span className="text-sm font-medium">This order was cancelled.</span>
      </div>
    );
  }

  const currentIndex = TRACK_STEPS.findIndex(
    (step) => step === normalizedStatus,
  );

  if (currentIndex === -1) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        Tracking is unavailable for the order status: {status}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="flex min-w-[600px] items-start">
        {TRACK_STEPS.map((step, index) => {
          const isReached = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === TRACK_STEPS.length - 1;

          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex shrink-0 flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    isReached
                      ? "bg-[#f77f00] text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isReached ? <Check size={16} /> : index + 1}
                </div>

                <span
                  className={`mt-1 text-center text-[11px] ${
                    isReached ? "font-medium text-[#003049]" : "text-gray-400"
                  }`}
                >
                  {ORDER_STATUS_LABELS[step] ?? step}
                </span>

                {isCurrent && (
                  <span className="text-[10px] font-medium text-[#f77f00]">
                    Current
                  </span>
                )}
              </div>

              {!isLast && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    index < currentIndex ? "bg-[#f77f00]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

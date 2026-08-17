import type { StockStatus } from "../../services/productService";

type StockBadgeProps = {
  stockStatus?: string | null;
  stockQuantity: number;
  className?: string;
};

const STOCK_STYLES: Record<StockStatus, string> = {
  IN_STOCK: "bg-green-100 text-green-700",
  LOW_STOCK: "bg-yellow-100 text-yellow-700",
  OUT_OF_STOCK: "bg-red-100 text-red-700",
};

const STOCK_LABELS: Record<StockStatus, string> = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
};

function isStockStatus(value: unknown): value is StockStatus {
  return (
    value === "IN_STOCK" ||
    value === "LOW_STOCK" ||
    value === "OUT_OF_STOCK"
  );
}

function deriveStockStatus(stockQuantity: number): StockStatus {
  if (stockQuantity <= 0) {
    return "OUT_OF_STOCK";
  }

  if (stockQuantity <= 20) {
    return "LOW_STOCK";
  }

  return "IN_STOCK";
}

export default function StockBadge({
  stockStatus,
  stockQuantity,
  className = "",
}: StockBadgeProps) {
  const resolvedStatus = isStockStatus(stockStatus)
    ? stockStatus
    : deriveStockStatus(stockQuantity);

  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STOCK_STYLES[resolvedStatus]} ${className}`}
    >
      {STOCK_LABELS[resolvedStatus]}
    </span>
  );
}

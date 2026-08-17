type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_MAP = { sm: "w-4 h-4 border-2", md: "w-8 h-8 border-2", lg: "w-12 h-12 border-4" };

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${SIZE_MAP[size]} rounded-full border-gray-200 border-t-[#f77f00] animate-spin ${className}`}
    />
  );
}

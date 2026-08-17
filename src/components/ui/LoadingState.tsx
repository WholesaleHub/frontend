import Spinner from "./Spinner";

export default function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Spinner size="lg" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}

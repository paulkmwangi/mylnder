import { LoaderCircle } from "lucide-react";

export default function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-myinder-muted">
      <LoaderCircle className="animate-spin" size={18} /> {label}
    </div>
  );
}
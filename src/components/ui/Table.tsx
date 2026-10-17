import type { ReactNode } from "react";

export default function Table({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white"><table className="w-full text-left text-sm">{children}</table></div>;
}
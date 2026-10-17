import type { ReactNode } from "react";

export default function Modal({ children }: { children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-3 backdrop-blur-[2px] sm:p-6">{children}</div>;
}
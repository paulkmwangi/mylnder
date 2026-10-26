import { X } from "lucide-react";
import type { ReactNode } from "react";

export default function ConfirmDialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-myinder-navy">{title}</h2><button onClick={onClose} aria-label="Close"><X size={20}/></button></div>{children}</div></div>;
}
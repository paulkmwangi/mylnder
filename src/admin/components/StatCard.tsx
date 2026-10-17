import type { LucideIcon } from "lucide-react";

export default function StatCard({ title, value, Icon }: { title: string; value: string | number; Icon: LucideIcon }) {
  return <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><p className="text-sm text-myinder-muted">{title}</p><span className="rounded-xl bg-blue-50 p-2.5 text-myinder-blue"><Icon size={20}/></span></div><p className="mt-4 text-3xl font-bold text-myinder-navy">{value}</p></div>;
}
import type { LucideIcon } from "lucide-react";
import ColorfulIcon from "./ColorfulIcon";

export default function StatCard({ title, value, Icon, tone }: { title: string; value: string | number; Icon: LucideIcon; tone: "blue" | "orange" | "purple" | "green" }) {
  return <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><p className="text-sm text-myinder-muted">{title}</p><ColorfulIcon Icon={Icon} tone={tone} size={20}/></div><p className="mt-4 text-3xl font-bold text-myinder-navy">{value}</p></div>;
}
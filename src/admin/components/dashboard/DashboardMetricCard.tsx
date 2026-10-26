import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import ColorfulIcon from "../ColorfulIcon";

type Tone = "blue" | "orange" | "purple" | "green";

const cardColors: Record<Tone, string> = {
  blue: "border-blue-200 bg-sky-100/70",
  orange: "border-orange-200 bg-orange-50/90",
  purple: "border-indigo-100 bg-blue-50",
  green: "border-emerald-200 bg-emerald-50/90",
};

const cardTones: Record<Tone, string> = {
  blue: "dashboard-stat-blink-blue",
  orange: "dashboard-stat-blink-orange",
  purple: "dashboard-stat-blink-purple",
  green: "dashboard-stat-blink-green",
};

export function MiniAnalytics({
  values,
  label,
  tone,
}: {
  values: number[];
  label: string;
  tone: Tone;
}) {
  if (!values.length) return null;
  const width = 120;
  const height = 24;
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = height - 2 - (value / max) * (height - 4);
    return `${x},${y}`;
  });
  const stroke = {
    blue: "#2563eb",
    orange: "#c2410c",
    purple: "#4f46e5",
    green: "#047857",
  }[tone];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className="mt-2 h-6 w-full max-w-40 overflow-visible"
      preserveAspectRatio="none"
    >
      <polyline
        points={points.join(" ")}
        pathLength={1}
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="dashboard-mini-analytics"
      />
    </svg>
  );
}

interface Props {
  title: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  to: string;
  tone: Tone;
  trend: number[];
  trendLabel: string;
}

export default function DashboardMetricCard({
  title,
  value,
  detail,
  icon: Icon,
  to,
  tone,
  trend,
  trendLabel,
}: Props) {
  return (
    <Link
      to={to}
      className={`dashboard-reveal dashboard-stat-blink ${cardTones[tone]} group flex min-h-32 min-w-0 items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-myinder-blue sm:min-h-36 sm:p-5 ${cardColors[tone]}`}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
        <div>
          <p className="text-xs font-semibold text-myinder-muted sm:text-sm">{title}</p>
          <p className="mt-2 break-words text-2xl font-extrabold leading-tight tabular-nums text-myinder-navy sm:text-3xl">{value}</p>
          <p className="mt-2 text-[11px] text-myinder-muted sm:text-xs">{detail}</p>
        </div>
        <MiniAnalytics values={trend} label={trendLabel} tone={tone} />
      </div>
      <ColorfulIcon Icon={Icon} tone={tone} size={23} className="h-11 w-11 shrink-0 self-start rounded-2xl sm:h-14 sm:w-14" />
    </Link>
  );
}

import { useId } from "react";
import type { LucideIcon } from "lucide-react";

const palettes = {
  blue: { colors: ["#2563eb", "#06b6d4", "#4f46e5"], background: "from-blue-50 to-cyan-50" },
  orange: { colors: ["#f97316", "#facc15", "#ef4444"], background: "from-orange-50 to-amber-50" },
  purple: { colors: ["#7c3aed", "#ec4899", "#4f46e5"], background: "from-purple-50 to-pink-50" },
  green: { colors: ["#10b981", "#84cc16", "#06b6d4"], background: "from-green-50 to-cyan-50" },
  pink: { colors: ["#ec4899", "#f43f5e", "#8b5cf6"], background: "from-pink-50 to-rose-50" },
  amber: { colors: ["#f59e0b", "#f97316", "#eab308"], background: "from-amber-50 to-orange-50" },
  sky: { colors: ["#0ea5e9", "#2563eb", "#22d3ee"], background: "from-sky-50 to-blue-50" },
} as const;

type Tone = keyof typeof palettes;

interface Props {
  Icon: LucideIcon;
  tone?: Tone;
  size?: number;
  badge?: boolean;
  className?: string;
}

export default function ColorfulIcon({
  Icon,
  tone = "blue",
  size = 20,
  badge = true,
  className = "",
}: Props) {
  const id = useId().replace(/:/g, "");
  const palette = palettes[tone];

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${
        badge
          ? `rounded-xl bg-gradient-to-br ${palette.background} p-2.5 shadow-sm ring-1 ring-white`
          : ""
      } ${className}`}
    >
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.colors[0]} />
            <stop offset="55%" stopColor={palette.colors[1]} />
            <stop offset="100%" stopColor={palette.colors[2]} />
          </linearGradient>
        </defs>
      </svg>
      <Icon size={size} stroke={`url(#${id})`} strokeWidth={2.35} />
    </span>
  );
}

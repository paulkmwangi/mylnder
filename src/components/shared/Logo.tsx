import { UsersRound } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-myinder-orange text-white shadow-sm">
        <UsersRound size={27} strokeWidth={2.5} />
      </div>
      <div className="leading-tight">
        <div className="text-[25px] font-extrabold tracking-tight text-myinder-navy">
          My<span className="text-myinder-orange">inder</span>
        </div>
        <div className="text-[12px] font-medium tracking-wide text-myinder-muted">Campus Community</div>
      </div>
    </div>
  );
}
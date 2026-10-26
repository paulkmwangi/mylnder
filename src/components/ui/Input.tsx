import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { search?: boolean };

export default function Input({ search = false, className = "", ...props }: Props) {
  return (
    <div className="relative">
      {search && <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-myinder-blue" />}
      <input className={`w-full min-w-0 rounded-xl border border-blue-100 bg-white py-3 text-base text-myinder-navy outline-none transition placeholder:text-myinder-muted focus:border-blue-300 focus:ring-4 focus:ring-blue-50 sm:text-sm ${search ? "pl-11 pr-4" : "px-4"} ${className}`} {...props} />
    </div>
  );
}
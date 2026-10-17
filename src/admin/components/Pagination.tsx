import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  return <div className="flex items-center gap-2">
    <button aria-label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)} className="rounded-lg border border-blue-100 bg-white p-2 text-myinder-blue hover:bg-blue-50 disabled:opacity-40"><ChevronLeft size={20}/></button>
    {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => <button key={item} onClick={() => onChange(item)} className={`h-9 min-w-9 rounded-lg border px-3 text-sm ${page === item ? "border-myinder-orange bg-myinder-orange text-white" : "border-blue-100 bg-white text-myinder-blue hover:bg-blue-50"}`}>{item}</button>)}
    <button aria-label="Next page" disabled={page === totalPages} onClick={() => onChange(page + 1)} className="rounded-lg border border-blue-100 bg-white p-2 text-myinder-blue hover:bg-blue-50 disabled:opacity-40"><ChevronRight size={20}/></button>
  </div>;
}
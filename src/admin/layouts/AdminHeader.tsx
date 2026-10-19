import { Download, Menu } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

interface Props {
  search: string;
  onSearch: (value: string) => void;
  university: string;
  universities: string[];
  onUniversityChange: (value: string) => void;
  showUniversityFilter: boolean;
  onExport: () => void;
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export default function AdminHeader({
  search,
  onSearch,
  university,
  universities,
  onUniversityChange,
  showUniversityFilter,
  onExport,
  onMenuClick,
  sidebarOpen,
}: Props) {
  return (
    <header className="sticky top-0 z-20 flex min-h-[72px] items-center gap-3 border-b border-blue-100 bg-white/95 px-4 backdrop-blur sm:min-h-[82px] sm:px-8">
      <button type="button" onClick={onMenuClick} aria-label="Open navigation menu" aria-expanded={sidebarOpen} aria-controls="admin-sidebar" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-myinder-navy hover:bg-blue-50 lg:hidden">
        <Menu size={24} />
      </button>
      <div className="flex-1" />
      <div className="flex w-full max-w-[680px] items-center gap-2">
        <div className="min-w-0 flex-1">
          <Input search value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search users by name, university, or invoice..." />
        </div>
        {showUniversityFilter && (
          <label className="sr-only" htmlFor="user-university-filter">Filter users by university</label>
        )}
        {showUniversityFilter && (
          <select
            id="user-university-filter"
            value={university}
            onChange={(event) => onUniversityChange(event.target.value)}
            aria-label="Filter users by university"
            className="w-[min(36vw,220px)] shrink-0 rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm text-myinder-navy outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="">All universities</option>
            {universities.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        )}
      </div>
      <Button onClick={onExport} className="shrink-0 px-4 sm:px-5"><Download size={19}/><span className="hidden sm:inline">Export Data</span><span className="sm:hidden">Export</span></Button>
    </header>
  );
}
import { Download, Menu } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function AdminHeader({ search, onSearch, onExport, onMenuClick, sidebarOpen }: { search: string; onSearch: (value: string) => void; onExport: () => void; onMenuClick: () => void; sidebarOpen: boolean }) {
  return (
    <header className="sticky top-0 z-20 flex min-h-[72px] items-center gap-3 border-b border-blue-100 bg-white/95 px-4 backdrop-blur sm:min-h-[82px] sm:px-8">
      <button type="button" onClick={onMenuClick} aria-label="Open navigation menu" aria-expanded={sidebarOpen} aria-controls="admin-sidebar" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-myinder-navy hover:bg-blue-50 lg:hidden">
        <Menu size={24} />
      </button>
      <div className="flex-1" />
      <div className="w-full max-w-[370px]">
        <Input search value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search users by name or university..." />
      </div>
      <Button onClick={onExport} className="shrink-0 px-4 sm:px-5"><Download size={19}/><span className="hidden sm:inline">Export Data</span><span className="sm:hidden">Export</span></Button>
    </header>
  );
}
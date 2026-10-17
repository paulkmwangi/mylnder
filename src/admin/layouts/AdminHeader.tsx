import { Download,  } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function AdminHeader({ search, onSearch, onExport }: { search: string; onSearch: (value: string) => void; onExport: () => void }) {
  return (
    <header className="sticky top-0 z-10 flex min-h-[82px] items-center justify-end gap-3 border-b border-blue-100 bg-white/95 px-5 backdrop-blur sm:px-8">
      <div className="w-full max-w-[370px]">
        <Input search value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search users by name or university..." />
      </div>
      <Button onClick={onExport} className="shrink-0 px-4 sm:px-5"><Download size={19}/><span className="hidden sm:inline">Export Data</span><span className="sm:hidden">Export</span></Button>
    </header>
  );
}
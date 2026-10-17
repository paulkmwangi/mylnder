import { NavLink } from "react-router-dom";
import { Home, UsersRound, ChevronRight, CircleUserRound } from "lucide-react";
import Logo from "../../components/shared/Logo";

const links = [
  { label: "Overview", href: "/admin/dashboard", Icon: Home },
  { label: "Users", href: "/admin/users", Icon: UsersRound }
];

export default function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[272px] flex-col border-r border-blue-100 bg-white/95 px-3 py-6 lg:flex">
      <div className="px-3"><Logo /></div>
      <nav className="mt-10 space-y-2">
        {links.map(({ label, href, Icon }) => (
          <NavLink key={href} to={href} className={({ isActive }) => `flex items-center gap-5 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${isActive ? "bg-myinder-orange text-white shadow-sm" : "text-myinder-navy hover:bg-blue-50"}`}>
            <Icon size={25} strokeWidth={2.2} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-blue-100 px-3 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-myinder-blue"><CircleUserRound size={34}/></div>
          <div className="min-w-0 flex-1"><p className="text-sm font-bold text-myinder-navy">Admin</p><p className="mt-0.5 text-xs text-myinder-muted">Super Admin</p></div>
          <ChevronRight size={20} className="text-myinder-blue"/>
        </div>
      </div>
    </aside>
  );
}
import { NavLink } from "react-router-dom";
import { useEffect } from "react";
import { Home, UsersRound, ChevronRight, CircleUserRound, X, CreditCard } from "lucide-react";
import Logo from "../../components/shared/Logo";

const links = [
  { label: "Overview", href: "/admin/dashboard", Icon: Home },
  { label: "Users", href: "/admin/users", Icon: UsersRound },
  { label: "Payment plan", href: "/admin/plan", Icon: CreditCard },
];

type Props = { open: boolean; onClose: () => void };

export default function AdminSidebar({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation menu"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-900/40 transition-opacity lg:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      />
      <aside id="admin-sidebar" className={`fixed inset-y-0 left-0 z-40 flex w-[min(85vw,272px)] flex-col border-r border-blue-100 bg-white px-3 py-6 shadow-xl transition-transform duration-200 lg:z-20 lg:w-[272px] lg:translate-x-0 lg:shadow-none ${open ? "visible translate-x-0" : "invisible -translate-x-full"} lg:visible`}>
        <div className="flex items-center justify-between px-3">
          <Logo />
          <button type="button" onClick={onClose} aria-label="Close navigation menu" className="rounded-lg p-2 text-myinder-navy hover:bg-blue-50 lg:hidden">
            <X size={22} />
          </button>
        </div>
        <nav aria-label="Admin navigation" className="mt-10 space-y-2">
          {links.map(({ label, href, Icon }) => (
            <NavLink key={href} to={href} onClick={onClose} className={({ isActive }) => `flex items-center gap-5 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${isActive ? "bg-myinder-orange text-white shadow-sm" : "text-myinder-navy hover:bg-blue-50"}`}>
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
    </>
  );
}
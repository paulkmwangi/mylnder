import { NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, UsersRound, CircleUserRound, X, CreditCard, University, ReceiptText, UserPlus, LogOut } from "lucide-react";
import Logo from "../../components/shared/Logo";
import ColorfulIcon from "../components/ColorfulIcon";
import { useAdminAuthStore } from "../stores/adminAuthStore";

const links = [
  { label: "Overview", href: "/admin/dashboard", Icon: Home, tone: "blue" as const },
  { label: "Users", href: "/admin/users", Icon: UsersRound, tone: "purple" as const },
  { label: "Universities", href: "/admin/universities", Icon: University, tone: "orange" as const },
  { label: "Invoices", href: "/admin/invoices", Icon: ReceiptText, tone: "green" as const },
  { label: "Payment plan", href: "/admin/plan", Icon: CreditCard, tone: "green" as const },
  { label: "Admins", href: "/admin/admins", Icon: UserPlus, tone: "purple" as const },
];

type Props = { open: boolean; onClose: () => void };

export default function AdminSidebar({ open, onClose }: Props) {
  const admin = useAdminAuthStore((state) => state.admin);
  const signOut = useAdminAuthStore((state) => state.signOut);
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    onClose();
    navigate("/admin/login", { replace: true });
  };

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
          {links.map(({ label, href, Icon, tone }) => (
            <NavLink key={href} to={href} onClick={onClose} className={({ isActive }) => `flex items-center gap-5 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${isActive ? "bg-myinder-orange text-white shadow-sm" : "text-myinder-navy hover:bg-blue-50"}`}>
              <ColorfulIcon Icon={Icon} tone={tone} size={23} badge={false} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-blue-100 px-3 pt-4">
          <div className="flex items-center gap-3">
            <ColorfulIcon Icon={CircleUserRound} tone="blue" size={34} className="h-12 w-12 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-myinder-navy">{admin?.name ?? "Admin"}</p>
              <p className="mt-0.5 truncate text-xs text-myinder-muted">{admin?.email ?? "Administrator"}</p>
            </div>
            <button type="button" onClick={handleSignOut} aria-label="Sign out" title="Sign out" className="rounded-lg p-2 text-myinder-muted hover:bg-blue-50 hover:text-myinder-navy">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
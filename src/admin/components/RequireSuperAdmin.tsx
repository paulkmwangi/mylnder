import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuthStore, isSuperAdmin } from "../stores/adminAuthStore";

export default function RequireSuperAdmin() {
  const admin = useAdminAuthStore((state) => state.admin);

  return isSuperAdmin(admin)
    ? <Outlet />
    : <Navigate to="/admin/users" replace />;
}

import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuthStore } from "../stores/adminAuthStore";

export default function RequireAdmin() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const expiresAt = useAdminAuthStore((state) => state.expiresAt);
  const signOut = useAdminAuthStore((state) => state.signOut);
  const location = useLocation();
  const authenticated =
    Boolean(accessToken) && expiresAt !== null && expiresAt > Date.now();

  useEffect(() => {
    if (!accessToken) return;
    const remainingMs = expiresAt === null ? 0 : expiresAt - Date.now();
    if (remainingMs <= 0) {
      signOut();
      return;
    }

    const timeout = window.setTimeout(signOut, remainingMs);
    return () => window.clearTimeout(timeout);
  }, [accessToken, expiresAt, signOut]);

  if (!authenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

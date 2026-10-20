import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  loginAdmin,
  type AdminAccount,
} from "../services/adminAuthService";
import { clearAdminCaches } from "../services/localCache";

interface AdminAuthState {
  accessToken: string | null;
  expiresAt: number | null;
  admin: AdminAccount | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      expiresAt: null,
      admin: null,
      signIn: async (email, password) => {
        const session = await loginAdmin(email, password);
        clearAdminCaches();
        set({
          accessToken: session.accessToken,
          expiresAt: session.expiresAt,
          admin: session.admin,
        });
      },
      signOut: () => {
        clearAdminCaches();
        set({ accessToken: null, expiresAt: null, admin: null });
      },
    }),
    {
      name: "mylnder-admin-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        admin: state.admin,
      }),
    },
  ),
);

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  loginAdmin,
  type AdminAccount,
} from "../services/adminAuthService";
import { queryClient } from "../../app/queryClient";
import { clearPersistedImageQueries } from "../../app/imageQueryPersister";
import { userQueryKeys } from "../queries/userQueryKeys";

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
        const previousAdminId = useAdminAuthStore.getState().admin?.id;
        queryClient.removeQueries({ queryKey: userQueryKeys.all });
        if (previousAdminId && previousAdminId !== session.admin.id) {
          void clearPersistedImageQueries(previousAdminId).catch((error: unknown) => {
            console.error("Unable to clear previous account image queries.", error);
          });
        }
        set({
          accessToken: session.accessToken,
          expiresAt: session.expiresAt,
          admin: session.admin,
        });
      },
      signOut: () => {
        const adminId = useAdminAuthStore.getState().admin?.id;
        queryClient.removeQueries({ queryKey: userQueryKeys.all });
        if (adminId) {
          void clearPersistedImageQueries(adminId).catch((error: unknown) => {
            console.error("Unable to clear persisted image queries on sign-out.", error);
          });
        }
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

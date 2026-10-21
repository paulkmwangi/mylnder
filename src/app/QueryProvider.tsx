import { useMemo } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useAdminAuthStore } from "../admin/stores/adminAuthStore";
import { queryClient } from "./queryClient";
import { createImageQueryPersister } from "./imageQueryPersister";

const IMAGE_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const adminId = useAdminAuthStore((state) => state.admin?.id);
  const persister = useMemo(
    () => createImageQueryPersister(adminId ?? "signed-out"),
    [adminId],
  );

  return (
    <PersistQueryClientProvider
      key={adminId ?? "signed-out"}
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: IMAGE_CACHE_MAX_AGE,
        buster: "user-image-cache-v1",
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === "success" &&
            query.queryKey[0] === "admin-user-data" &&
            query.queryKey[1] === adminId &&
            query.queryKey[2] === "image",
        },
      }}
      onError={() => {
        console.error("Unable to restore persisted image queries.");
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

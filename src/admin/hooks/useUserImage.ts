import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuthStore } from "../stores/adminAuthStore";
import { resolveImageUrl } from "../services/imageService";
import { userQueryKeys } from "../queries/userQueryKeys";

const IMAGE_STALE_TIME = 24 * 60 * 60 * 1000;
const IMAGE_GC_TIME = 7 * 24 * 60 * 60 * 1000;

async function fetchImage(imageUrl: string): Promise<Blob> {
  const resolvedUrl = await resolveImageUrl(imageUrl);
  const response = await fetch(resolvedUrl);
  if (!response.ok) {
    throw new Error(`Unable to load image (HTTP ${response.status}).`);
  }
  return response.blob();
}

export function useUserImage(imageUrl: string) {
  const adminId = useAdminAuthStore((state) => state.admin?.id);
  const query = useQuery({
    queryKey: userQueryKeys.image(adminId ?? "", imageUrl),
    queryFn: () => fetchImage(imageUrl),
    enabled: Boolean(adminId && imageUrl),
    staleTime: IMAGE_STALE_TIME,
    gcTime: IMAGE_GC_TIME,
  });
  const [objectUrl, setObjectUrl] = useState("");

  useEffect(() => {
    if (!query.data) {
      setObjectUrl("");
      return;
    }

    const url = URL.createObjectURL(query.data);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [query.data]);

  return { objectUrl, loading: query.isPending, error: query.error };
}

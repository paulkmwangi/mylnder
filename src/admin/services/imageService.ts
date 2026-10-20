import { adminApiFetch } from "./adminApiFetch";

type ApiRecord = Record<string, unknown>;

const resolvedUrlCache = new Map<string, { url: string; expiresAt: number }>();
const pendingUrlRequests = new Map<string, Promise<string>>();
const CACHE_TTL_MS = 60_000;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as ApiRecord
    : {};
}

export async function resolveImageUrl(
  savedPhotoUrl: string,
  options: { refresh?: boolean } = {},
): Promise<string> {
  const parsedUrl = new URL(savedPhotoUrl, window.location.origin);
  if (!parsedUrl.pathname.startsWith("/api/images/")) return savedPhotoUrl;

  if (options.refresh) {
    resolvedUrlCache.delete(savedPhotoUrl);
  }

  const cached = resolvedUrlCache.get(savedPhotoUrl);
  if (!options.refresh && cached && cached.expiresAt > Date.now()) return cached.url;
  const pending = options.refresh ? undefined : pendingUrlRequests.get(savedPhotoUrl);
  if (pending) return pending;

  const request = (async () => {
    const response = await adminApiFetch(savedPhotoUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Unable to resolve image URL (HTTP ${response.status}).`);
    }

    const payload: unknown = await response.json();
    const imageUrl = asRecord(payload).imageUrl;
    if (typeof imageUrl !== "string" || !imageUrl.trim()) {
      throw new Error("The image API response did not contain an imageUrl.");
    }

    resolvedUrlCache.set(savedPhotoUrl, {
      url: imageUrl,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return imageUrl;
  })();

  pendingUrlRequests.set(savedPhotoUrl, request);
  try {
    return await request;
  } finally {
    if (pendingUrlRequests.get(savedPhotoUrl) === request) {
      pendingUrlRequests.delete(savedPhotoUrl);
    }
  }
}

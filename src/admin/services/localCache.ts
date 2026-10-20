interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

export function readLocalCache<T>(
  key: string,
  isValue: (value: unknown) => value is T,
): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;

    const entry: unknown = JSON.parse(raw);
    if (
      !entry ||
      typeof entry !== "object" ||
      !("expiresAt" in entry) ||
      typeof entry.expiresAt !== "number" ||
      !("value" in entry)
    ) {
      localStorage.removeItem(key);
      return undefined;
    }

    const cacheEntry = entry as CacheEntry<unknown>;
    if (cacheEntry.expiresAt <= Date.now() || !isValue(cacheEntry.value)) {
      localStorage.removeItem(key);
      return undefined;
    }
    return cacheEntry.value;
  } catch {
    console.warn("Unable to read local cache", { key });
    return undefined;
  }
}

export function writeLocalCache<T>(key: string, value: T, ttlMs: number): void {
  try {
    const entry: CacheEntry<T> = {
      expiresAt: Date.now() + ttlMs,
      value,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    console.warn("Unable to write local cache", { key });
  }
}

export function clearAdminCaches(): void {
  try {
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter(
      (key): key is string =>
        key === "mylnder-admin-users-v1" ||
        (key !== null && key.startsWith("mylnder-admin-invoice-v1-")),
    );
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    console.warn("Unable to clear admin data cache.");
  }
}

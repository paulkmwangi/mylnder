import type { SavedUser } from "../types/admin.types";

const ADMIN_USERS_API_URL =
  import.meta.env.VITE_ADMIN_USERS_API_URL ??
  "";

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" ? value as ApiRecord : {};
}

function firstText(record: ApiRecord, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function resolvePhotoUrl(value: unknown): string | null {
  const photo = typeof value === "string" ? value : firstText(asRecord(value), [
    "url", "photo_url", "image_url", "src", "path", "filename", "file_name",
  ]);
  if (!photo) return null;

  if (/^(https?:|data:|blob:)/i.test(photo)) return photo;

  const apiOrigin = new URL(ADMIN_USERS_API_URL).origin;
  if (photo.startsWith("/")) return `${apiOrigin}${photo}`;
  if (photo.includes("/")) return `${apiOrigin}/${photo}`;

  // The API documents stored images at GET /api/images/:filename.
  return `${apiOrigin}/api/images/${encodeURIComponent(photo)}`;
}

function mapUser(value: unknown, index: number): SavedUser {
  const record = asRecord(value);
  const school = asRecord(record.school ?? record.university);
  const rawPhotos =
    record.photos ?? record.images ?? record.user_photos ?? record.photo_urls ?? [];
  const photos = Array.isArray(rawPhotos) ? rawPhotos : [];

  return {
    id: firstText(record, ["user_id", "id", "uuid"], `user-${index + 1}`),
    name: firstText(record, ["name", "full_name", "username"], "Unnamed user"),
    university:
      firstText(record, ["university_name", "university", "school_name", "school"], "") ||
      firstText(school, ["name", "school_name", "university_name"], "") ||
      firstText(record, ["school_id"], "University not provided"),
    major: firstText(record, ["major", "course", "program", "field_of_study"], "Not provided"),
    instagram: firstText(record, ["ig_username", "instagram", "instagram_username", "instagram_handle"], "Not provided")
      .replace(/^@+/, "")
      .replace(/^(.+)$/, "@$1"),
    images: photos.map(resolvePhotoUrl).filter((url): url is string => Boolean(url)),
  };
}

export async function getUsers(): Promise<SavedUser[]> {
  const response = await fetch(ADMIN_USERS_API_URL, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Unable to load users (HTTP ${response.status}).`);
  }

  const payload: unknown = await response.json();
  let rows: unknown;

  if (Array.isArray(payload)) {
    rows = payload;
  } else {
    const body = asRecord(payload);
    rows =
      body.users ??
      body.data ??
      body.items ??
      body.results ??
      asRecord(body.data).users ??
      asRecord(body.data).items;
  }

  if (!Array.isArray(rows)) {
    throw new Error("The users API response did not contain a users array.");
  }

  return rows.map(mapUser);
}

export async function getUserById(id: string): Promise<SavedUser | undefined> {
  const users = await getUsers();
  return users.find((user) => user.id === id);
}

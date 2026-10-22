import type { SavedUser } from "../types/admin.types";
import { adminApiFetch } from "./adminApiFetch";

const ADMIN_USERS_API_URL =
  import.meta.env.VITE_ADMIN_USERS_API_URL;
const ADMIN_API_ORIGIN =
  import.meta.env.VITE_ADMIN_API_ORIGIN ||
  new URL(ADMIN_USERS_API_URL, window.location.origin).origin;

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

function getPhotoUrl(value: unknown): string | null {
  const photo = typeof value === "string" ? value : firstText(asRecord(value), [
    "url", "photo_url", "image_url", "src", "path", "filename", "file_name",
  ]);
  if (!photo) return null;

  if (/^(https?:|data:|blob:)/i.test(photo)) {
    const photoUrl = new URL(photo);
    if (import.meta.env.DEV && photoUrl.origin === ADMIN_API_ORIGIN) {
      return `${photoUrl.pathname}${photoUrl.search}${photoUrl.hash}`;
    }
    return photo;
  }

  if (photo.startsWith("/")) {
    return import.meta.env.DEV ? photo : `${ADMIN_API_ORIGIN}${photo}`;
  }
  if (photo.includes("/")) {
    return import.meta.env.DEV ? `/${photo}` : `${ADMIN_API_ORIGIN}/${photo}`;
  }

  const imagePath = `/api/images/${encodeURIComponent(photo)}`;
  return import.meta.env.DEV ? imagePath : `${ADMIN_API_ORIGIN}${imagePath}`;
}

function getPostingStatus(record: ApiRecord): boolean {
  const value = record.is_posted ?? record.isPosted ?? record.posted;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
}

function mapUser(value: unknown, index: number): SavedUser {
  const record = asRecord(value);
  const school = asRecord(record.school ?? record.university);
  const invoice = asRecord(record.invoice);
  const payment = asRecord(record.payment);
  const invoiceNumber =
    firstText(record, ["invoice_number", "invoiceNumber"]) ||
    firstText(invoice, ["invoice_number", "invoiceNumber", "number"]) ||
    firstText(payment, ["invoice_number", "invoiceNumber", "reference"]) ||
    firstText(record, ["payment_reference"]);
  const rawPhotos =
    record.photos ?? record.images ?? record.user_photos ?? record.photo_urls ?? [];
  const photos = Array.isArray(rawPhotos) ? rawPhotos : [];
  let posterPhotoUrl: string | undefined;
  if (photos.length > 0) {
    try {
      posterPhotoUrl = getPhotoUrl(photos[0]) ?? undefined;
    } catch {
      posterPhotoUrl = undefined;
    }
  }
  const universityId =
    firstText(school, ["id", "school_id", "university_id", "uuid"]) ||
    firstText(record, ["school_id", "university_id", "schoolId", "universityId"]);

  return {
    id: firstText(record, ["user_id", "id", "uuid"], `user-${index + 1}`),
    name: firstText(record, ["name", "full_name", "username"], "Unnamed user"),
    ...(universityId ? { universityId } : {}),
    university:
      firstText(record, ["university_name", "university", "school_name", "school"], "") ||
      firstText(school, ["name", "school_name", "university_name"], "") ||
      firstText(record, ["school_id"], "University not provided"),
    major: firstText(record, ["major", "course", "program", "field_of_study"], "Not provided"),
    instagram: firstText(record, ["ig_username", "instagram", "instagram_username", "instagram_handle"], "Not provided")
      .replace(/^@+/, "")
      .replace(/^(.+)$/, "@$1"),
    bio: firstText(record, ["bio", "about", "user_bio"]),
    song: firstText(record, ["song", "song_option", "song_choice", "song_selection", "selected_song"]),
    createdAt: firstText(record, ["created_at", "createdAt"]),
    ...(invoiceNumber ? { invoiceNumber } : {}),
    isPosted: getPostingStatus(record),
    ...(posterPhotoUrl ? { posterPhotoUrl } : {}),
    images: photos.map(getPhotoUrl).filter((url): url is string => Boolean(url)),
  };
}

interface UsersPage {
  rows: unknown[];
  totalPages?: number;
}

async function getUsersPage(page: number): Promise<UsersPage> {
  const separator = ADMIN_USERS_API_URL.includes("?") ? "&" : "?";
  const response = await adminApiFetch(
    `${ADMIN_USERS_API_URL}${separator}page=${page}&limit=100`,
    {
    method: "GET",
    headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to load users (HTTP ${response.status}).`);
  }

  const payload: unknown = await response.json();
  let rows: unknown;

  if (Array.isArray(payload)) {
    return { rows: payload };
  } else {
    const body = asRecord(payload);
    rows =
      body.users ??
      body.data ??
      body.items ??
      body.results ??
      asRecord(body.data).users ??
      asRecord(body.data).items;
    const totalPages = body.total_pages;
    if (typeof totalPages === "number" && Number.isInteger(totalPages) && totalPages >= 0) {
      if (!Array.isArray(rows)) {
        throw new Error("The users API response did not contain a users array.");
      }
      return { rows, totalPages };
    }
  }

  if (!Array.isArray(rows)) {
    throw new Error("The users API response did not contain a users array.");
  }

  return { rows };
}

async function loadUsers(): Promise<SavedUser[]> {
  const firstPage = await getUsersPage(1);
  const rows = [...firstPage.rows];
  const pageCount = firstPage.totalPages ?? 1;

  for (let page = 2; page <= pageCount; page += 1) {
    const result = await getUsersPage(page);
    rows.push(...result.rows);
  }

  return rows.map(mapUser);
}

export function getUsers(): Promise<SavedUser[]> {
  return loadUsers();
}

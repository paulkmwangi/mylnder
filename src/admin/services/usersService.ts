import type { SavedUser } from "../types/admin.types";
import { readLocalCache, writeLocalCache } from "./localCache";
import { adminApiFetch } from "./adminApiFetch";

const ADMIN_USERS_API_URL =
  import.meta.env.VITE_ADMIN_USERS_API_URL;
const ADMIN_API_ORIGIN =
  import.meta.env.VITE_ADMIN_API_ORIGIN ||
  new URL(ADMIN_USERS_API_URL, window.location.origin).origin;
const USERS_CACHE_KEY = "mylnder-admin-users-v1";
const USERS_CACHE_TTL_MS = 5 * 60 * 1000;

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

  // The API documents stored images at GET /api/images/:filename.
  const imagePath = `/api/images/${encodeURIComponent(photo)}`;
  return import.meta.env.DEV ? imagePath : `${ADMIN_API_ORIGIN}${imagePath}`;
}

function mapUser(value: unknown, index: number): SavedUser {
  const record = asRecord(value);
  const school = asRecord(record.school ?? record.university);
  const invoice = asRecord(record.invoice);
  const payment = asRecord(record.payment);
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
    bio: firstText(record, ["bio", "about", "user_bio"]),
    song: firstText(record, ["song", "song_option", "song_choice", "song_selection", "selected_song"]),
    createdAt: firstText(record, ["created_at", "createdAt"]),
    invoiceNumber:
      firstText(record, ["invoice_number", "invoiceNumber"]) ||
      firstText(invoice, ["invoice_number", "invoiceNumber"]) ||
      firstText(payment, ["invoice_number", "invoiceNumber"]) ||
      undefined,
    images: photos.map(getPhotoUrl).filter((url): url is string => Boolean(url)),
  };
}

function isSavedUserList(value: unknown): value is SavedUser[] {
  return Array.isArray(value) && value.every((item) =>
    item !== null &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.university === "string" &&
    typeof item.major === "string" &&
    typeof item.instagram === "string" &&
    Array.isArray(item.images) &&
    item.images.every((image: unknown) => typeof image === "string"),
  );
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

let usersRequest: Promise<SavedUser[]> | null = null;

export function getUsers(options: { refresh?: boolean } = {}): Promise<SavedUser[]> {
  if (options.refresh) {
    try {
      localStorage.removeItem(USERS_CACHE_KEY);
    } catch {
      console.warn("Unable to clear user cache.");
    }
  }

  const cachedUsers = readLocalCache(USERS_CACHE_KEY, isSavedUserList);
  if (cachedUsers && !options.refresh) return Promise.resolve(cachedUsers);
  if (usersRequest) return usersRequest;

  const request = loadUsers().then((users) => {
    writeLocalCache(USERS_CACHE_KEY, users, USERS_CACHE_TTL_MS);
    return users;
  });
  usersRequest = request;
  void request.then(
    () => {
      if (usersRequest === request) usersRequest = null;
    },
    () => {
      if (usersRequest === request) usersRequest = null;
    },
  );
  return request;
}

export async function getUserById(id: string): Promise<SavedUser | undefined> {
  const users = await getUsers();
  return users.find((user) => user.id === id);
}


import { adminApiFetch } from "./adminApiFetch";

export interface UniversityRecord {
  id: string;
  name: string;
  profileName?: string;
  customColor?: string;
}

const USERS_API_URL = import.meta.env.VITE_ADMIN_USERS_API_URL;

const UNIVERSITIES_API_URL =
  import.meta.env.VITE_ADMIN_UNIVERSITIES_API_URL ||
  USERS_API_URL.replace(/\/users\/?$/, "/Schools");
const UNIVERSITIES_CACHE_TTL_MS = 60_000;
let universitiesCache: { rows: UniversityRecord[]; expiresAt: number } | null = null;
let universitiesRequest: Promise<UniversityRecord[]> | null = null;

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiRecord)
    : {};
}

function getErrorMessage(payload: unknown): string | undefined {
  const body = asRecord(payload);
  const message = body.message ?? asRecord(body.response).message;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (Array.isArray(message)) {
    const messages = message.filter(
      (item): item is string => typeof item === "string"
    );

    if (messages.length) {
      return messages.join(", ");
    }
  }

  return undefined;
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function mapUniversity(value: unknown): UniversityRecord {
  const record = asRecord(value);

  const id = record.id ?? record.university_id ?? record.uuid;
  const name = record.name ?? record.university_name;
  const profileName = record.profile_name ?? record.profileName;
  const customColor = record.custom_color ?? record.customColor;

  if (
    (typeof id !== "string" && typeof id !== "number") ||
    typeof name !== "string" ||
    !name.trim()
  ) {
    throw new Error(
      "The universities API returned an invalid university."
    );
  }

  return {
    id: String(id),
    name: name.trim(),
    ...(typeof profileName === "string" && profileName.trim()
      ? { profileName: profileName.trim() }
      : {}),
    ...(typeof customColor === "string"
      ? { customColor }
      : {}),
  };
}
  

export async function getUniversities(): Promise<UniversityRecord[]> {
  if (universitiesCache && universitiesCache.expiresAt > Date.now()) {
    return universitiesCache.rows;
  }
  if (universitiesRequest) return universitiesRequest;

  const request = loadUniversities();
  universitiesRequest = request;
  try {
    const rows = await request;
    universitiesCache = {
      rows,
      expiresAt: Date.now() + UNIVERSITIES_CACHE_TTL_MS,
    };
    return rows;
  } finally {
    if (universitiesRequest === request) universitiesRequest = null;
  }
}

async function loadUniversities(): Promise<UniversityRecord[]> {
  if (!UNIVERSITIES_API_URL) {
    throw new Error("The universities API URL is not configured.");
  }

  const response = await adminApiFetch(UNIVERSITIES_API_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload) ??
        `Unable to load universities (HTTP ${response.status}).`
    );
  }

  const body = asRecord(payload);
  const data = asRecord(body.data);

  const rows = Array.isArray(payload)
    ? payload
    : body.universities ??
      data.universities ??
      body.data ??
      body.items ??
      body.results;

  if (!Array.isArray(rows)) {
    throw new Error(
      "The universities API response did not contain a universities array."
    );
  }

  return rows.map(mapUniversity);
}

export async function createUniversity(
  name: string,
  profileName: string,
  customColor: string
): Promise<void> {
  if (!UNIVERSITIES_API_URL) {
    throw new Error("The universities API URL is not configured.");
  }

  const response = await adminApiFetch(UNIVERSITIES_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name.trim(),
      profile_name: profileName.trim(),
      custom_color: customColor.trim(),
    }),
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload) ??
        `Unable to add the university (HTTP ${response.status}).`
    );
  }

  universitiesCache = null;
}

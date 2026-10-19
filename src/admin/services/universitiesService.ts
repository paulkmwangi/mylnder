export interface UniversityRecord {
  id: string;
  name: string;
  customColor?: string;
}

const USERS_API_URL =
  import.meta.env.VITE_ADMIN_USERS_API_URL || "/api/admin/users";
const UNIVERSITIES_API_URL =
  import.meta.env.VITE_ADMIN_UNIVERSITIES_API_URL ||
  USERS_API_URL.replace(/\/users\/?$/, "/Schools");

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as ApiRecord
    : {};
}

function getErrorMessage(payload: unknown): string | undefined {
  const body = asRecord(payload);
  const message = body.message ?? asRecord(body.response).message;
  if (typeof message === "string" && message.trim()) return message;
  if (Array.isArray(message)) {
    const messages = message.filter((item): item is string => typeof item === "string");
    if (messages.length) return messages.join(", ");
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
  const name = record.name ?? record.university_name ?? record.profile_name;
  const customColor = record.custom_color;
  if (
    (typeof id !== "string" && typeof id !== "number") ||
    typeof name !== "string" ||
    !name.trim()
  ) {
    throw new Error("The universities API returned an invalid university.");
  }
  return {
    id: String(id),
    name: name.trim(),
    ...(typeof customColor === "string" ? { customColor } : {}),
  };
}

export async function getUniversities(): Promise<UniversityRecord[]> {
  const response = await fetch(UNIVERSITIES_API_URL, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const payload = await readPayload(response);
  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload) ?? `Unable to load universities (HTTP ${response.status}).`,
    );
  }

  const body = asRecord(payload);
  const data = asRecord(body.data);
  const rows = Array.isArray(payload)
    ? payload
    : body.universities ?? data.universities ?? body.data ?? body.items ?? body.results;
  if (!Array.isArray(rows)) {
    throw new Error("The universities API response did not contain a universities array.");
  }
  return rows.map(mapUniversity);
}

export async function createUniversity(
  name: string,
  profileName: string,
  customColor: string,
): Promise<void> {
  const response = await fetch(UNIVERSITIES_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      profile_name: profileName,
      custom_color: customColor,
    }),
  });
  const payload = await readPayload(response);
  if (!response.ok) {
    console.error("Admin API request failed", {
      operation: "create_university",
      status: response.status,
    });
    throw new Error(
      getErrorMessage(payload) ?? `Unable to add the university (HTTP ${response.status}).`,
    );
  }
}

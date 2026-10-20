export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AdminSession {
  accessToken: string;
  expiresAt: number;
  admin: AdminAccount;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
}

type ApiRecord = Record<string, unknown>;

const ADMIN_API_BASE_URL = import.meta.env.DEV
  ? ""
  : import.meta.env.VITE_ADMIN_API_ORIGIN?.replace(/\/+$/, "") ?? "";

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiRecord)
    : {};
}

function getErrorMessage(payload: unknown): string | undefined {
  const body = asRecord(payload);
  const response = asRecord(body.response);
  const rawMessage = body.message ?? response.message ?? body.error;

  if (typeof rawMessage === "string" && rawMessage.trim()) {
    return rawMessage.trim();
  }

  if (Array.isArray(rawMessage)) {
    const messages = rawMessage.filter(
      (message): message is string => typeof message === "string",
    );
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
    return { message: text };
  }
}

function getAdmin(payload: unknown): AdminAccount {
  const body = asRecord(payload);
  const data = asRecord(body.data);
  const admin = asRecord(body.admin ?? data.admin ?? body.data ?? payload);
  const id = admin.id ?? admin.admin_id ?? admin.uuid;

  if (
    (typeof id !== "string" && typeof id !== "number") ||
    typeof admin.name !== "string" ||
    typeof admin.email !== "string"
  ) {
    throw new Error("The admin API returned an invalid admin account.");
  }

  const lastLoginAt = admin.last_login_at ?? admin.lastLoginAt;
  const createdAt = admin.created_at ?? admin.createdAt;

  return {
    id: String(id),
    name: admin.name,
    email: admin.email,
    ...(typeof lastLoginAt === "string" ? { lastLoginAt } : {}),
    ...(typeof createdAt === "string" ? { createdAt } : {}),
  };
}

async function postAdminRequest(
  endpoint: string,
  body: object,
  accessToken?: string,
): Promise<unknown> {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${ADMIN_API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const payload = await readPayload(response);

  if (!response.ok) {
    const fallback =
      response.status === 409
        ? "An admin with this email already exists."
        : `Admin request failed (HTTP ${response.status}).`;
    throw new Error(getErrorMessage(payload) ?? fallback);
  }

  return payload;
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<AdminSession> {
  const payload = await postAdminRequest("/api/admin/login", {
    email: email.trim(),
    password,
  });
  const body = asRecord(payload);
  const accessToken = body.access_token;
  const expiresIn = body.expires_in;

  if (
    typeof accessToken !== "string" ||
    !accessToken.trim() ||
    typeof expiresIn !== "number" ||
    !Number.isFinite(expiresIn) ||
    expiresIn <= 0
  ) {
    throw new Error("The admin login response did not contain a valid session.");
  }

  return {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
    admin: getAdmin(payload),
  };
}

export async function createAdmin(
  admin: CreateAdminInput,
  accessToken?: string,
): Promise<AdminAccount> {
  const payload = await postAdminRequest("/api/admin", {
    name: admin.name.trim(),
    email: admin.email.trim(),
    password: admin.password,
  }, accessToken);

  return getAdmin(payload);
}

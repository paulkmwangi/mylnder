export interface PaymentPlan {
  id: string;
  name: string;
  amount: string;
  currency: string;
  features: string[];
  isActive: boolean;
  isCurrent: boolean;
}

const USERS_API_URL =
  import.meta.env.VITE_ADMIN_USERS_API_URL ;
const API_BASE_URL = USERS_API_URL.replace(/\/admin\/users\/?$/, "").replace(/\/$/, "");

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as ApiRecord
    : {};
}

function getErrorMessage(payload: unknown): string | undefined {
  const body = asRecord(payload);
  const response = asRecord(body.response);
  const message = body.message ?? response.message;
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

function mapPlan(value: unknown): PaymentPlan {
  const record = asRecord(value);
  const amount = record.amount;
  const features = Array.isArray(record.features)
    ? record.features.filter((feature): feature is string => typeof feature === "string")
    : [];
  if (
    typeof record.id !== "string" ||
    typeof record.name !== "string" ||
    (typeof amount !== "number" && typeof amount !== "string") ||
    typeof record.currency !== "string"
  ) {
    throw new Error("The payment plan API returned an invalid plan.");
  }

  return {
    id: record.id,
    name: record.name,
    amount: String(amount),
    currency: record.currency,
    features,
    isActive: record.is_active === true,
    isCurrent: record.is_current === true,
  };
}

async function requestPlan(url: string, init?: RequestInit): Promise<PaymentPlan> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = await readPayload(response);
  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload) ?? `Unable to save the payment plan (HTTP ${response.status}).`,
    );
  }
  return mapPlan(payload);
}

export function getCurrentPlan(): Promise<PaymentPlan> {
  return requestPlan(`${API_BASE_URL}/plan`);
}

export function createPlanVersion(
  plan: Pick<PaymentPlan, "name" | "currency" | "features"> & { amount: number },
): Promise<PaymentPlan> {
  return requestPlan(`${API_BASE_URL}/plan`, {
    method: "POST",
    body: JSON.stringify(plan),
  });
}

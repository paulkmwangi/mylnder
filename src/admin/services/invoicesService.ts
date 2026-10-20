
import { readLocalCache, writeLocalCache } from "./localCache";
import { adminApiFetch } from "./adminApiFetch";

export interface UserInvoice {
  invoiceNumber: string;
  status:
    | "successful"
    | "pending"
    | "failed"
    | "canceled"
    | "refunded"
    | "unknown";
  amountMinor?: number;
  currency?: string;
  paidAt?: string;
}

const INVOICE_CACHE_TTL_MS = 2 * 60 * 1000;

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as ApiRecord)
    : {};
}

function isUserInvoice(value: unknown): value is UserInvoice {
  if (!value || typeof value !== "object") {
    return false;
  }

  const invoice = value as ApiRecord;

  return (
    typeof invoice.invoiceNumber === "string" &&
    [
      "successful",
      "pending",
      "failed",
      "canceled",
      "refunded",
      "unknown",
    ].includes(String(invoice.status))
  );
}

function mapInvoice(
  value: unknown,
  fallbackInvoiceNumber = "",
): UserInvoice {
  const record = asRecord(value);
  const invoice = asRecord(record.invoice);
  const payment = asRecord(record.payment);

  const rawStatus = String(
    invoice.status ??
      payment.status ??
      record.status ??
      "",
  ).toLowerCase();

  const status: UserInvoice["status"] =
    [
      "paid",
      "succeeded",
      "successful",
      "success",
      "completed",
    ].includes(rawStatus)
      ? "successful"
      : [
          "pending",
          "processing",
          "requires_payment_method",
          "requires_action",
          "requires_confirmation",
        ].includes(rawStatus)
        ? "pending"
        : ["canceled", "cancelled", "void"].includes(rawStatus)
          ? "canceled"
          : [
              "refunded",
              "partially_refunded",
            ].includes(rawStatus)
            ? "refunded"
            : [
                "failed",
                "declined",
                "payment_failed",
            ].includes(rawStatus)
              ? "failed"
              : "unknown";

  const rawAmount =
    invoice.amount_minor ??
    invoice.amount_paid ??
    payment.amount_minor ??
    payment.amount ??
    record.amount_minor;

  const amountMinor =
    typeof rawAmount === "number" ||
    (typeof rawAmount === "string" &&
      rawAmount.trim() !== "")
      ? Number(rawAmount)
      : undefined;

  const rawCurrency =
    invoice.currency ??
    payment.currency ??
    record.currency;

  const currency =
    typeof rawCurrency === "string" &&
    /^[a-zA-Z]{3}$/.test(rawCurrency)
      ? rawCurrency.toUpperCase()
      : undefined;

  const rawPaidAt =
    invoice.paid_at ??
    payment.paid_at ??
    record.paid_at;

  const rawInvoiceNumber =
    invoice.invoice_number ??
    invoice.invoiceNumber ??
    record.invoice_number ??
    record.invoiceNumber;

  return {
    invoiceNumber:
      typeof rawInvoiceNumber === "string" &&
      rawInvoiceNumber.trim()
        ? rawInvoiceNumber.trim()
        : fallbackInvoiceNumber,
    status,
    ...(amountMinor !== undefined &&
    Number.isFinite(amountMinor)
      ? { amountMinor }
      : {}),
    ...(currency ? { currency } : {}),
    ...(typeof rawPaidAt === "string" && rawPaidAt
      ? { paidAt: rawPaidAt }
      : {}),
  };
}

function getInvoicesEndpoint(): string {
  const origin = String(import.meta.env.VITE_ADMIN_API_ORIGIN ?? "")
    .trim()
    .replace(/\/+$/, "");

  const configuredPath = String(
    import.meta.env.VITE_INVOICES_API_URL ?? "/api/admin/invoices",
  ).trim();

  try {
    const baseUrl = origin ? new URL(origin) : undefined;

    if (!import.meta.env.DEV && !baseUrl) {
      throw new Error(
        "Missing VITE_ADMIN_API_ORIGIN. Set it in your frontend .env file.",
      );
    }
    if (!import.meta.env.DEV && baseUrl?.protocol !== "https:") {
      throw new Error("The backend API must use HTTPS.");
    }

    const endpoint = new URL(configuredPath, `${origin || window.location.origin}/`);
    if (baseUrl && endpoint.origin !== baseUrl.origin) {
      throw new Error(
        "The invoices API URL must use the configured backend origin.",
      );
    }

    const path = endpoint.pathname.replace(/\/+$/, "");
    return import.meta.env.DEV
      ? path
      : `${endpoint.origin}${path}`;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Invalid invoices API URL configuration.");
  }
}

async function readResponse(
  response: Response,
): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function getErrorMessage(
  payload: unknown,
  status: number,
): string {
  const message = asRecord(payload).message;

  return typeof message === "string" && message.trim()
    ? message
    : `Unable to load invoices (HTTP ${status}).`;
}

const pendingRequests = new Map<
  string,
  Promise<UserInvoice>
>();

/**
 * Fetch one invoice by invoice number.
 */
export function getInvoice(
  invoiceNumber: string,
  options: { refresh?: boolean } = {},
): Promise<UserInvoice> {
  const normalizedInvoiceNumber = invoiceNumber.trim().toUpperCase();

  if (!normalizedInvoiceNumber) {
    return Promise.reject(
      new Error("Invoice number is required."),
    );
  }

  const cacheKey =
    `mylnder-admin-invoice-v1-${normalizedInvoiceNumber}`;

  if (options.refresh) {
    try {
      localStorage.removeItem(cacheKey);
    } catch {
      console.warn("Unable to clear invoice cache.");
    }
  } else {
    const cachedInvoice = readLocalCache(
      cacheKey,
      isUserInvoice,
    );

    if (cachedInvoice) {
      return Promise.resolve(cachedInvoice);
    }
  }

  const existingRequest = pendingRequests.get(
    normalizedInvoiceNumber,
  );

  if (existingRequest) {
    return existingRequest;
  }

  const request = (async (): Promise<UserInvoice> => {
    const response = await adminApiFetch(
      `${getInvoicesEndpoint()}/${encodeURIComponent(
        normalizedInvoiceNumber,
      )}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    const payload = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getErrorMessage(payload, response.status),
      );
    }

    const invoice = mapInvoice(
      payload,
      normalizedInvoiceNumber,
    );

    writeLocalCache(
      cacheKey,
      invoice,
      INVOICE_CACHE_TTL_MS,
    );

    return invoice;
  })();

  pendingRequests.set(normalizedInvoiceNumber, request);

  void request.then(
    () => {
      if (
        pendingRequests.get(normalizedInvoiceNumber) === request
      ) {
        pendingRequests.delete(normalizedInvoiceNumber);
      }
    },
    () => {
      if (
        pendingRequests.get(normalizedInvoiceNumber) === request
      ) {
        pendingRequests.delete(normalizedInvoiceNumber);
      }
    },
  );

  return request;
}

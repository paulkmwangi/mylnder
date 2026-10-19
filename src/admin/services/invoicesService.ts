
import { readLocalCache, writeLocalCache } from "./localCache";

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

export interface InvoiceListResponse {
  items: UserInvoice[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}


const INVOICE_CACHE_TTL_MS = 2 * 60 * 1000;

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiRecord)
    : {};
}

function isUserInvoice(value: unknown): value is UserInvoice {
  if (!value || typeof value !== "object") return false;

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
  const payment = asRecord(record.payment);

  const rawStatus = String(
    payment.status ?? record.status ?? "",
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
        ].includes(rawStatus)
        ? "pending"
        : ["canceled", "cancelled", "void"].includes(rawStatus)
          ? "canceled"
          : ["refunded", "partially_refunded"].includes(rawStatus)
            ? "refunded"
            : [
                "failed",
                "declined",
                "payment_failed",
              ].includes(rawStatus)
              ? "failed"
              : "unknown";

  const rawAmount = record.amount_minor ?? payment.amount_minor;

  const amountMinor =
    typeof rawAmount === "number" ||
    (typeof rawAmount === "string" && rawAmount.trim() !== "")
      ? Number(rawAmount)
      : undefined;

  const rawCurrency = record.currency ?? payment.currency;

  const currency =
    typeof rawCurrency === "string" &&
    /^[a-zA-Z]{3}$/.test(rawCurrency)
      ? rawCurrency.toUpperCase()
      : undefined;

  const rawPaidAt = record.paid_at ?? payment.paid_at;

  const rawInvoiceNumber =
    record.invoice_number ?? record.invoiceNumber;

  return {
    invoiceNumber:
      typeof rawInvoiceNumber === "string" &&
      rawInvoiceNumber.trim()
        ? rawInvoiceNumber.trim()
        : fallbackInvoiceNumber,
    status,
    ...(amountMinor !== undefined && Number.isFinite(amountMinor)
      ? { amountMinor }
      : {}),
    ...(currency ? { currency } : {}),
    ...(typeof rawPaidAt === "string" && rawPaidAt
      ? { paidAt: rawPaidAt }
      : {}),
  };
}

function getInvoicesEndpoint(): string {
  const origin = String(
    import.meta.env.VITE_ADMIN_API_ORIGIN ?? "",
  ).trim().replace(/\/+$/, "");

  const configuredPath = String(
    import.meta.env.VITE_INVOICES_API_URL,
  ).trim();

  if (!origin) {
    throw new Error(
      "Missing VITE_ADMIN_API_ORIGIN. Set it in your frontend .env file.",
    );
  }

  if (!configuredPath) {
    throw new Error(
      "Missing VITE_INVOICES_API_URL.",
    );
  }

  try {
    const endpoint = new URL(configuredPath, `${origin}/`);

    if (
      endpoint.origin !== new URL(origin).origin ||
      endpoint.protocol !== "https:"
    ) {
      throw new Error("The invoices API URL must use your configured HTTPS backend.");
    }

    return endpoint.toString().replace(/\/+$/, "");
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Invalid invoices API URL configuration.");
  }
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) return {};

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

const pendingRequests = new Map<string, Promise<UserInvoice>>();

/**
 * Fetch one invoice by invoice number.
 */
export function getInvoice(
  invoiceNumber: string,
  options: { refresh?: boolean } = {},
): Promise<UserInvoice> {
  const normalizedInvoiceNumber = invoiceNumber.trim().toUpperCase();

  if (!normalizedInvoiceNumber) {
    return Promise.reject(new Error("Invoice number is required."));
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
    const cachedInvoice = readLocalCache(cacheKey, isUserInvoice);

    if (cachedInvoice) {
      return Promise.resolve(cachedInvoice);
    }
  }

  const existingRequest = pendingRequests.get(normalizedInvoiceNumber);

  if (existingRequest) return existingRequest;

  const request = (async (): Promise<UserInvoice> => {
    const response = await fetch(
      `${getInvoicesEndpoint()}/${encodeURIComponent(normalizedInvoiceNumber)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    const payload = await readResponse(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(payload, response.status));
    }

    const invoice = mapInvoice(payload, normalizedInvoiceNumber);

    writeLocalCache(cacheKey, invoice, INVOICE_CACHE_TTL_MS);

    return invoice;
  })();

  pendingRequests.set(normalizedInvoiceNumber, request);

  void request.then(
    () => {
      if (pendingRequests.get(normalizedInvoiceNumber) === request) {
        pendingRequests.delete(normalizedInvoiceNumber);
      }
    },
    () => {
      if (pendingRequests.get(normalizedInvoiceNumber) === request) {
        pendingRequests.delete(normalizedInvoiceNumber);
      }
    },
  );

  return request;
}

/**
 * Fetch one page of invoices.
 * GET /api/admin/invoices?page=1&limit=20
 */
export async function getAllInvoices(
  page = 1,
  limit = 20,
): Promise<InvoiceListResponse> {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Page must be a positive integer.");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Limit must be between 1 and 100.");
  }

  const url = new URL(getInvoicesEndpoint());

  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.status));
  }

  // Support both a paginated response and a plain array.
  const data = asRecord(payload);

  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(data.items)
      ? data.items
      : [];

  const items = records.map((item) => {
    const record = asRecord(item);

    return mapInvoice(
      item,
      typeof record.invoice_number === "string"
        ? record.invoice_number
        : typeof record.invoiceNumber === "string"
          ? record.invoiceNumber
          : "",
    );
  });

  const total = Number(data.total ?? items.length);
  const responsePage = Number(data.page ?? page);
  const responseLimit = Number(data.limit ?? limit);

  const totalPages = Number(
    data.total_pages ??
      (total === 0 ? 0 : Math.ceil(total / responseLimit)),
  );

  return {
    items,
    total,
    page: responsePage,
    limit: responseLimit,
    total_pages: totalPages,
  };
}

/**
 * Fetch every page and combine the results.
 */
export async function getEveryInvoice(): Promise<UserInvoice[]> {
  const invoices: UserInvoice[] = [];
  const limit = 100;
  let page = 1;

  while (true) {
    const result = await getAllInvoices(page, limit);

    invoices.push(...result.items);

    if (
      result.items.length === 0 ||
      page >= result.total_pages ||
      invoices.length >= result.total
    ) {
      break;
    }

    page += 1;
  }

  return invoices;
}
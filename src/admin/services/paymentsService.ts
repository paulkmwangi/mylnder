export interface PaymentInvoiceResponse {
  status: string;
  invoice_status: string;
  invoice?: {
    invoice_number?: string;
  } | null;
}

const PAYMENTS_API_URL = import.meta.env.VITE_PAYMENTS_API_URL;

export async function getPaymentInvoiceNumber(
  paymentId: string,
  statusToken: string,
): Promise<string> {
  if (!PAYMENTS_API_URL) {
    throw new Error("VITE_PAYMENTS_API_URL is not configured.");
  }

  const response = await fetch(
    `${PAYMENTS_API_URL}/${encodeURIComponent(paymentId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${statusToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch payment invoice (${response.status}).`,
    );
  }

  const data = (await response.json()) as PaymentInvoiceResponse;

  return data.invoice?.invoice_number ?? "";
}
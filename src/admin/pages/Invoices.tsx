import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/shared/LoadingState";

import {
  getAllInvoices,
  type UserInvoice,
} from "../services/invoicesService";

interface InvoiceRow {
  invoiceNumber: string;
  invoice: UserInvoice;
}

type InvoiceStatus = UserInvoice["status"];

type StatusPresentation = {
  label: string;
  className: string;
  Icon: typeof CheckCircle2;
};

const statusPresentation: Record<
  InvoiceStatus,
  StatusPresentation
> = {
  successful: {
    label: "Successful",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700 ring-amber-200",
    Icon: Clock3,
  },
  failed: {
    label: "Failed",
    className:
      "bg-rose-50 text-rose-700 ring-rose-200",
    Icon: XCircle,
  },
  canceled: {
    label: "Canceled",
    className:
      "bg-slate-100 text-slate-600 ring-slate-200",
    Icon: XCircle,
  },
  refunded: {
    label: "Refunded",
    className:
      "bg-violet-50 text-violet-700 ring-violet-200",
    Icon: CheckCircle2,
  },
  unknown: {
    label: "Unknown",
    className:
      "bg-slate-100 text-slate-600 ring-slate-200",
    Icon: AlertCircle,
  },
};

function formatAmount(invoice: UserInvoice): string {
  if (
    invoice.amountMinor === undefined ||
    !invoice.currency
  ) {
    return "Amount unavailable";
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: invoice.currency.toUpperCase(),
    }).format(invoice.amountMinor / 100);
  } catch {
    return `${(invoice.amountMinor / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`;
  }
}

function formatDate(date?: string): string {
  if (!date) {
    return "Not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}



export default function Invoices() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const loadInvoices = useCallback(
    async (refresh = false) => {
      try {
        setError(null);

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const result = await getAllInvoices(1, 100, {
          refresh,
        });

        const invoices = result.items ?? [];

        const mappedRows: InvoiceRow[] = invoices.map(
          (invoice) => ({
            invoiceNumber: invoice.invoiceNumber,
            invoice,
          }),
        );

        setRows(mappedRows);
      } catch (cause: unknown) {
        const message =
          cause instanceof Error
            ? cause.message
            : "Unable to load invoices. Please try again.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter(({ invoiceNumber, invoice }) => {
      const matchesSearch =
        !term ||
        [
          invoiceNumber,
          invoice.status,
          invoice.currency ?? "",
          invoice.paidAt ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: rows.length,

      successful: rows.filter(
        ({ invoice }) =>
          invoice.status === "successful",
      ).length,

      pending: rows.filter(
        ({ invoice }) =>
          invoice.status === "pending",
      ).length,

      attention: rows.filter(({ invoice }) =>
        [
          "failed",
          "canceled",
          "refunded",
          "unknown",
        ].includes(invoice.status),
      ).length,
    };
  }, [rows]);

  const summaryCards = [
    {
      label: "All invoices",
      value: counts.all,
      gradient: "from-indigo-500 to-violet-600",
      Icon: FileText,
    },
    {
      label: "Successful",
      value: counts.successful,
      gradient: "from-emerald-500 to-teal-500",
      Icon: CheckCircle2,
    },
    {
      label: "Pending",
      value: counts.pending,
      gradient: "from-amber-400 to-orange-500",
      Icon: Clock3,
    },
    {
      label: "Needs attention",
      value: counts.attention,
      gradient: "from-rose-500 to-pink-600",
      Icon: AlertCircle,
    },
  ];

  if (loading) {
    return <LoadingState label="Loading invoices..." />;
  }

  return (
    <main className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
            <FileText size={25} />
          </span>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-myinder-navy sm:text-[34px]">
              Invoices
            </h1>

            <p className="mt-1 text-sm text-myinder-muted">
              Review invoices and monitor payment statuses.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => void loadInvoices(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing ? "animate-spin" : ""
            }
          />
          {refreshing ? "Refreshing..." : "Refresh invoices"}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">
            <p className="font-semibold">
              Could not load invoices
            </p>

            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={() => void loadInvoices()}
              className="mt-2 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(
          ({ label, value, gradient, Icon }) => (
            <article
              key={label}
              className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition hover:shadow-md"
            >
              <div
                className={`h-1.5 bg-gradient-to-r ${gradient}`}
              />

              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-myinder-muted">
                    {label}
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-myinder-navy">
                    {value}
                  </p>
                </div>

                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}
                >
                  <Icon size={21} />
                </span>
              </div>
            </article>
          ),
        )}
      </section>

      {/* Invoice list */}
      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        {/* Search and filter */}
        <div className="flex flex-col gap-3 border-b border-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="w-full sm:max-w-md">
            <Input
              search
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search invoice number or status..."
              aria-label="Search invoices"
            />
          </div>

          <label
            htmlFor="invoice-status-filter"
            className="sr-only"
          >
            Filter by payment status
          </label>

          <select
            id="invoice-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm text-myinder-navy outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="all">All statuses</option>
            <option value="successful">
              Successful
            </option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="canceled">Canceled</option>
            <option value="refunded">Refunded</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Empty state */}
        {rows.length === 0 && !error ? (
          <div className="px-5 py-16 text-center">
            <FileText
              size={42}
              className="mx-auto text-indigo-300"
            />

            <h2 className="mt-3 font-bold text-myinder-navy">
              No invoices found
            </h2>

            <p className="mt-1 text-sm text-myinder-muted">
              Invoices returned by your backend will appear here.
            </p>
          </div>
        ) : filteredRows.length === 0 && !error ? (
          <div className="px-5 py-14 text-center">
            <FileText
              size={36}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-semibold text-myinder-navy">
              No matching invoices
            </p>

            <p className="mt-1 text-sm text-myinder-muted">
              Try a different search term or status filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
            {filteredRows.map(
              ({ invoiceNumber, invoice }, index) => {
                const presentation =
                  statusPresentation[invoice.status];

                const StatusIcon = presentation.Icon;

                const amount = formatAmount(invoice);

                return (
                  <article
                    key={invoiceNumber}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
                  >
                    {/* Card accent */}
                    <div
                      className={`h-1.5 ${
                        invoice.status === "successful"
                          ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                          : invoice.status === "pending"
                            ? "bg-gradient-to-r from-amber-300 to-orange-500"
                            : invoice.status === "failed"
                              ? "bg-gradient-to-r from-rose-400 to-pink-500"
                              : "bg-gradient-to-r from-indigo-400 to-violet-500"
                      }`}
                    />

                    <div className="p-5">
                      {/* Invoice header */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <FileText size={21} />
                          </span>

                          <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                              Invoice
                            </p>

                            <h2 className="mt-1 break-all font-mono text-sm font-bold text-myinder-navy">
                              {invoiceNumber}
                            </h2>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${presentation.className}`}
                        >
                          <StatusIcon size={14} />
                          {presentation.label}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Invoice total
                        </p>

                        <p className="mt-1 break-words text-2xl font-extrabold tracking-tight text-myinder-navy">
                          {amount}
                        </p>

                        <p className="mt-1 text-xs uppercase text-slate-400">
                          {invoice.currency ?? "Currency unavailable"}
                        </p>
                      </div>

                      {/* Payment details */}
                      <div className="mt-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-sm text-myinder-muted">
                            Payment status
                          </span>

                          <span className="text-right text-sm font-semibold text-myinder-navy">
                            {presentation.label}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-3">
                          <span className="text-sm text-myinder-muted">
                            Paid at
                          </span>

                          <span className="text-right text-sm font-medium text-myinder-navy">
                            {formatDate(invoice.paidAt)}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-4 text-xs text-slate-400">
                        <span>MyInder · Payment invoice</span>

                        <span className="shrink-0 font-mono">
                          #{String(index + 1).padStart(3, "0")}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}

        {/* Refresh progress */}
        {refreshing && (
          <div className="flex items-center justify-center gap-2 border-t border-slate-100 py-4 text-sm text-myinder-muted">
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
            Updating invoices...
          </div>
        )}
      </section>

      <p className="text-center text-xs leading-5 text-myinder-muted">
        Invoice records and payment statuses are retrieved from your backend API.
      </p>
    </main>
  );
}
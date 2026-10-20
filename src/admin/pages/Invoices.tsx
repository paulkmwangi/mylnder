import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, FileText, RefreshCw, XCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingState from "../../components/shared/LoadingState";
import { getInvoice, type UserInvoice } from "../services/invoicesService";
import { getUsers } from "../services/usersService";

interface InvoiceRow {
  invoiceNumber: string;
  userName: string;
  invoice: UserInvoice | null;
  error?: string;
}

type InvoiceStatus = UserInvoice["status"];

const statusPresentation: Record<
  InvoiceStatus,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  successful: {
    label: "Successful",
    className: "bg-emerald-50 text-emerald-700",
    Icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700",
    Icon: Clock3,
  },
  failed: {
    label: "Failed",
    className: "bg-rose-50 text-rose-700",
    Icon: XCircle,
  },
  canceled: {
    label: "Canceled",
    className: "bg-slate-100 text-slate-600",
    Icon: XCircle,
  },
  refunded: {
    label: "Refunded",
    className: "bg-violet-50 text-violet-700",
    Icon: CheckCircle2,
  },
  unknown: {
    label: "Unknown",
    className: "bg-slate-100 text-slate-600",
    Icon: AlertCircle,
  },
};

async function loadInvoiceRows(refresh: boolean): Promise<InvoiceRow[]> {
  const users = await getUsers({ refresh });
  const linkedUsers = new Map<string, Set<string>>();

  for (const user of users) {
    const invoiceNumber = user.invoiceNumber?.trim();
    if (!invoiceNumber) continue;

    const key = invoiceNumber.toUpperCase();
    const names = linkedUsers.get(key) ?? new Set<string>();
    names.add(user.name);
    linkedUsers.set(key, names);
  }

  const invoiceNumbers = Array.from(linkedUsers.keys());
  const rows: InvoiceRow[] = new Array(invoiceNumbers.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < invoiceNumbers.length) {
      const index = nextIndex;
      nextIndex += 1;
      const invoiceNumber = invoiceNumbers[index];

      try {
        const invoice = await getInvoice(invoiceNumber, { refresh });
        rows[index] = {
          invoiceNumber: invoice.invoiceNumber || invoiceNumber,
          userName: Array.from(linkedUsers.get(invoiceNumber) ?? []).join(", "),
          invoice,
        };
      } catch (cause: unknown) {
        rows[index] = {
          invoiceNumber,
          userName: Array.from(linkedUsers.get(invoiceNumber) ?? []).join(", "),
          invoice: null,
          error:
            cause instanceof Error
              ? cause.message
              : "Unable to load payment status.",
        };
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(5, invoiceNumbers.length) },
      () => worker(),
    ),
  );

  return rows;
}

export default function Invoices() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadInvoices = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      setRows(await loadInvoiceRows(refresh));
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load users and their invoice references.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const status = row.invoice?.status ?? "unknown";
      const matchesSearch =
        !term ||
        `${row.invoiceNumber} ${row.userName} ${status} ${row.error ?? ""}`
          .toLowerCase()
          .includes(term);
      return matchesSearch && (statusFilter === "all" || status === statusFilter);
    });
  }, [rows, search, statusFilter]);

  const counts = useMemo(
    () => ({
      total: rows.length,
      successful: rows.filter((row) => row.invoice?.status === "successful").length,
      pending: rows.filter((row) => row.invoice?.status === "pending").length,
      attention: rows.filter(
        (row) =>
          !row.invoice ||
          ["failed", "canceled", "refunded", "unknown"].includes(row.invoice.status),
      ).length,
    }),
    [rows],
  );

  if (loading) return <LoadingState label="Loading invoices..." />;

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <FileText size={24} />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-myinder-navy">Invoices</h1>
            <p className="mt-1 text-sm text-myinder-muted">
              Invoice references and payment statuses linked to users.
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => void loadInvoices(true)}
          disabled={refreshing}
        >
          <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh invoices"}
        </Button>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Could not load invoices</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={() => void loadInvoices(true)}
              className="mt-2 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["All invoices", counts.total],
          ["Successful", counts.successful],
          ["Pending", counts.pending],
          ["Needs attention", counts.attention],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-myinder-muted">{label}</p>
            <p className="mt-1 text-2xl font-extrabold text-myinder-navy">{value}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="w-full sm:max-w-md">
            <Input
              search
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice number or user..."
              aria-label="Search invoices"
            />
          </div>
          <label htmlFor="invoice-status-filter" className="sr-only">
            Filter by payment status
          </label>
          <select
            id="invoice-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm text-myinder-navy outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="all">All statuses</option>
            {Object.entries(statusPresentation).map(([status, presentation]) => (
              <option key={status} value={status}>{presentation.label}</option>
            ))}
          </select>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <FileText size={42} className="mx-auto text-indigo-300" />
            <h2 className="mt-3 font-bold text-myinder-navy">No invoices found</h2>
            <p className="mt-1 text-sm text-myinder-muted">
              Invoices appear here when user records include an invoice number.
            </p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="px-5 py-14 text-center text-sm text-myinder-muted">
            No invoices match your search or status filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-50/70 text-xs uppercase tracking-wide text-myinder-muted">
                <tr>
                  <th scope="col" className="px-5 py-4">Invoice number</th>
                  <th scope="col" className="px-5 py-4">User</th>
                  <th scope="col" className="px-5 py-4">Payment status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const status = row.invoice?.status ?? "unknown";
                  const presentation = statusPresentation[status];
                  const StatusIcon = presentation.Icon;
                  return (
                    <tr key={row.invoiceNumber} className="border-t border-blue-50">
                      <td className="px-5 py-4 font-mono font-semibold text-myinder-navy">
                        {row.invoiceNumber}
                      </td>
                      <td className="px-5 py-4 font-medium text-myinder-navy">
                        {row.userName || "User unavailable"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${presentation.className}`}>
                          <StatusIcon size={14} />
                          {row.error ? "Unavailable" : presentation.label}
                        </span>
                        {row.error && (
                          <p className="mt-1 max-w-sm text-xs text-rose-700">{row.error}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {refreshing && (
          <div className="flex items-center justify-center gap-2 border-t border-slate-100 py-4 text-sm text-myinder-muted">
            <RefreshCw size={16} className="animate-spin" />
            Updating invoices...
          </div>
        )}
      </section>
    </main>
  );
}

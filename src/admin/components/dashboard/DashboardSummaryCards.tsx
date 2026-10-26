import { University, UsersRound, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import ColorfulIcon from "../ColorfulIcon";
import DashboardMetricCard, { MiniAnalytics } from "./DashboardMetricCard";
import type { RegistrationPeriod } from "./DashboardRegistrationSection";

type RevenuePeriod = "week" | "month" | "year";

interface Props {
  userCount: number;
  registrationTrend: number[];
  registrationPeriod: RegistrationPeriod;
  invoicesLoading: boolean;
  invoicesError: boolean;
  successfulPayments: number;
  pendingPayments: number;
  paymentStatusTrend: number[];
  universitiesLoading: boolean;
  universitiesError: boolean;
  universityCount: number;
  universityTrend: number[];
  revenueLoading: boolean;
  revenueError: boolean;
  totalRevenue: string;
  revenueTrend: number[];
  revenuePeriod: RevenuePeriod;
}

export default function DashboardSummaryCards({
  userCount,
  registrationTrend,
  registrationPeriod,
  invoicesLoading,
  invoicesError,
  successfulPayments,
  pendingPayments,
  paymentStatusTrend,
  universitiesLoading,
  universitiesError,
  universityCount,
  universityTrend,
  revenueLoading,
  revenueError,
  totalRevenue,
  revenueTrend,
  revenuePeriod,
}: Props) {
  const revenuePeriodLabel = revenuePeriod === "week"
    ? "the last seven days"
    : revenuePeriod === "month" ? "this month" : "this year";

  return (
    <section aria-label="Dashboard summary" className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4">
      <DashboardMetricCard
        title="Total users"
        value={userCount.toLocaleString()}
        detail="View all registered users"
        icon={UsersRound}
        tone="orange"
        to="/admin/users"
        trend={registrationTrend}
        trendLabel={`User registrations over the last ${registrationPeriod} days`}
      />
      <LinkPaymentOverview
        loading={invoicesLoading}
        error={invoicesError}
        successfulPayments={successfulPayments}
        pendingPayments={pendingPayments}
        trend={paymentStatusTrend}
      />
      <DashboardMetricCard
        title="All universities"
        value={universitiesLoading ? "…" : universityCount.toLocaleString()}
        detail={universitiesError ? "School total unavailable" : "Manage schools"}
        icon={University}
        tone="blue"
        to="/admin/universities"
        trend={universityTrend}
        trendLabel="User counts across the most represented universities"
      />
      <DashboardMetricCard
        title="Total revenue"
        value={revenueLoading ? "…" : totalRevenue}
        detail={revenueError ? "Revenue unavailable" : "From successful payments"}
        icon={Wallet}
        tone="purple"
        to="/admin/invoices"
        trend={revenueTrend}
        trendLabel={`Revenue trend for ${revenuePeriodLabel}`}
      />
    </section>
  );
}

function LinkPaymentOverview({
  loading,
  error,
  successfulPayments,
  pendingPayments,
  trend,
}: {
  loading: boolean;
  error: boolean;
  successfulPayments: number;
  pendingPayments: number;
  trend: number[];
}) {
  return (
    <Link
      to="/admin/invoices"
      className="dashboard-reveal dashboard-stat-blink dashboard-stat-blink-green group min-h-0 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-myinder-blue sm:min-h-36 sm:rounded-2xl sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold leading-tight text-myinder-navy sm:text-sm">Payments overview</p>
          <p className="mt-1 text-[10px] leading-tight text-myinder-muted sm:text-[11px]">{error ? "Payment data unavailable" : "Successful and pending payments"}</p>
        </div>
        <ColorfulIcon Icon={Wallet} tone="green" size={19} className="h-9 w-9 shrink-0 rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl" />
      </div>
      <div className="mt-2 flex items-end gap-4 sm:mt-3 sm:gap-5">
        <div>
          <p className="text-[10px] leading-tight text-myinder-muted sm:text-[11px]">Successful</p>
          <p className="text-xl font-extrabold leading-tight tabular-nums text-myinder-navy sm:text-2xl">{loading ? "…" : successfulPayments.toLocaleString()}</p>
        </div>
        <div className="pb-0.5">
          <p className="text-[10px] leading-tight text-myinder-muted sm:text-[11px]">Pending</p>
          <p className="text-base font-bold leading-tight tabular-nums text-myinder-navy sm:text-lg">{loading ? "…" : pendingPayments.toLocaleString()}</p>
        </div>
      </div>
      <MiniAnalytics values={trend} label="Invoice totals by payment status" tone="green" />
    </Link>
  );
}

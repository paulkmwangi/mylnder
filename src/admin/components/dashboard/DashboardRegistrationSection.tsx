import { ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

export type RegistrationPeriod = 7 | 30 | 90;

export interface RegistrationBucket {
  label: string;
  count: number;
}

const registrationPeriods: { days: RegistrationPeriod; label: string }[] = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

interface Props {
  buckets: RegistrationBucket[];
  period: RegistrationPeriod;
  onPeriodChange: (period: RegistrationPeriod) => void;
  registeredCount: number;
  hasRegistrationDates: boolean;
  maxRegistrationCount: number;
}

export default function DashboardRegistrationSection({
  buckets,
  period,
  onPeriodChange,
  registeredCount,
  hasRegistrationDates,
  maxRegistrationCount,
}: Props) {
  return (
    <section className="dashboard-reveal grid min-w-0 gap-5 rounded-2xl border border-orange-100 bg-white p-4 shadow-soft sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
      <div className="flex flex-col justify-between gap-5 rounded-xl bg-orange-50/70 p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-bold text-myinder-navy">New user registrations</h2>
          <p className="mt-1 text-sm text-myinder-muted">Profiles created during the selected period.</p>
        </div>
        <Link to="/admin/users" className="flex w-fit items-end gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-myinder-blue">
          <CalendarDays size={18} className="mb-1 text-myinder-orange" />
          <span className="text-3xl font-bold leading-none tabular-nums text-myinder-navy">{registeredCount}</span>
          <span className="text-sm text-myinder-muted">in {period} days</span>
          <ArrowRight size={15} className="mb-1 text-myinder-blue" />
        </Link>
      </div>
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-myinder-navy">Registration activity</p>
          <div className="flex w-fit rounded-lg bg-orange-50 p-1" role="group" aria-label="Registration chart period">
            {registrationPeriods.map(({ days, label }) => (
              <button
                key={days}
                type="button"
                aria-pressed={period === days}
                onClick={() => onPeriodChange(days)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${period === days ? "bg-white text-myinder-navy shadow-sm" : "text-myinder-muted hover:text-myinder-navy"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {hasRegistrationDates ? (
          <>
            <div
              className="grid h-40 items-end gap-1 border-b border-orange-100 pb-2 sm:h-48 sm:gap-2"
              style={{ gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))` }}
              role="img"
              aria-label={`New user registrations over the last ${period} days`}
            >
              {buckets.map(({ label, count }) => (
                <div key={label} className="flex h-full min-w-0 flex-col items-center justify-end gap-2" title={`${label}: ${count} ${count === 1 ? "user" : "users"}`}>
                  <span className="text-[10px] font-semibold tabular-nums text-myinder-muted sm:text-xs">{count || ""}</span>
                  <div
                    className={`dashboard-chart-bar w-full max-w-10 rounded-t-md ${count ? "bg-myinder-blue" : "bg-blue-50"}`}
                    style={{ height: `${count ? Math.max(8, (count / maxRegistrationCount) * 100) : 4}%` }}
                  />
                </div>
              ))}
            </div>
            <div
              className="mt-2 grid gap-1 text-center text-[9px] text-myinder-muted sm:gap-2 sm:text-xs"
              style={{ gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))` }}
              aria-hidden="true"
            >
              {buckets.map(({ label }) => <span key={label} className="truncate">{label}</span>)}
            </div>
          </>
        ) : (
          <p className="rounded-lg bg-orange-50/50 px-4 py-8 text-center text-sm text-myinder-muted">
            Registration dates are not available for these users.
          </p>
        )}
      </div>
    </section>
  );
}

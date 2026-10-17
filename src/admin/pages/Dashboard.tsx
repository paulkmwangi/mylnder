import { useMemo, useState } from "react";
import { UsersRound, Image, GraduationCap, University, CalendarDays } from "lucide-react";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import { useUsers } from "../hooks/useUsers";
import LoadingState from "../../components/shared/LoadingState";
import type { SavedUser } from "../types/admin.types";

type PeriodDays = 7 | 30 | 90;

interface UniversityCount {
  name: string;
  count: number;
}

interface RegistrationBucket {
  label: string;
  count: number;
}

const periodOptions: { days: PeriodDays; label: string }[] = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

function getUniversityCounts(users: SavedUser[]): UniversityCount[] {
  const counts = new Map<string, number>();
  for (const user of users) {
    const name = user.university.trim() || "University not provided";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const sorted = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));

  if (sorted.length <= 8) return sorted;
  const top = sorted.slice(0, 7);
  top.push({
    name: "Other universities",
    count: sorted.slice(7).reduce((total, university) => total + university.count, 0),
  });
  return top;
}

function getRegistrationBuckets(users: SavedUser[], periodDays: PeriodDays): RegistrationBucket[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - periodDays + 1);

  const bucketDays = periodDays === 7 ? 1 : periodDays === 30 ? 5 : 15;
  const registrations = users
    .map((user) => user.createdAt ? new Date(user.createdAt) : null)
    .filter((date): date is Date => date !== null && Number.isFinite(date.getTime()))
    .map((date) => {
      date.setHours(0, 0, 0, 0);
      return date;
    });

  const buckets: RegistrationBucket[] = [];
  const labelFormatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

  for (let offset = 0; offset < periodDays; offset += bucketDays) {
    const bucketStart = new Date(start);
    bucketStart.setDate(start.getDate() + offset);
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setDate(bucketStart.getDate() + Math.min(bucketDays, periodDays - offset));
    const count = registrations.filter((date) => date >= bucketStart && date < bucketEnd).length;
    buckets.push({ label: labelFormatter.format(bucketStart), count });
  }

  return buckets;
}

export default function Dashboard() {
  const { users, loading, error } = useUsers();
  const [periodDays, setPeriodDays] = useState<PeriodDays>(30);
  const universityCounts = useMemo(() => getUniversityCounts(users), [users]);
  const universityCount = useMemo(
    () => new Set(users.map((user) => user.university)).size,
    [users],
  );
  const registrationBuckets = useMemo(
    () => getRegistrationBuckets(users, periodDays),
    [users, periodDays],
  );
  const maxUniversityCount = Math.max(1, ...universityCounts.map(({ count }) => count));
  const maxRegistrationCount = Math.max(1, ...registrationBuckets.map(({ count }) => count));
  const registeredInPeriod = registrationBuckets.reduce((total, bucket) => total + bucket.count, 0);
  const hasRegistrationDates = users.some((user) => user.createdAt && Number.isFinite(new Date(user.createdAt).getTime()));

  if (loading) return <LoadingState />;
  if (error) return <p role="alert" className="py-10 text-center text-red-600">{error}</p>;

  return (
    <main>
      <div className="mb-7">
        <h1 className="text-3xl font-extrabold text-myinder-navy">Overview</h1>
        <p className="mt-1 text-sm text-myinder-muted">Welcome to your mylnder campus community dashboard.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Saved Users" value={users.length} Icon={UsersRound} />
        <StatCard title="Universities" value={universityCount} Icon={University} />
        <StatCard title="Study Areas" value={new Set(users.map((user) => user.major)).size} Icon={GraduationCap} />
        <StatCard title="Uploaded Images" value={users.reduce((sum, user) => sum + user.images.length, 0)} Icon={Image} />
      </div>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <article className="min-w-0 rounded-2xl border border-blue-100 bg-white p-5 shadow-soft sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-myinder-navy">Users by university</h2>
            <p className="mt-1 text-sm text-myinder-muted">Saved user profiles grouped by university.</p>
          </div>
          {universityCounts.length ? (
            <ul className="space-y-4">
              {universityCounts.map(({ name, count }) => (
                <li key={name}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-myinder-navy" title={name}>{name}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-myinder-muted">{count}</span>
                  </div>
                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-blue-50"
                    role="img"
                    aria-label={`${name}: ${count} ${count === 1 ? "user" : "users"}`}
                  >
                    <div
                      className="h-full rounded-full bg-myinder-orange"
                      style={{ width: `${(count / maxUniversityCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-myinder-muted">No university data available.</p>
          )}
        </article>

        <article className="min-w-0 rounded-2xl border border-blue-100 bg-white p-5 shadow-soft sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-myinder-navy">New user registrations</h2>
              <p className="mt-1 text-sm text-myinder-muted">Profiles created during the selected period.</p>
            </div>
            <div className="flex rounded-lg bg-blue-50 p-1" role="group" aria-label="Registration chart period">
              {periodOptions.map(({ days, label }) => (
                <button
                  key={days}
                  type="button"
                  aria-pressed={periodDays === days}
                  onClick={() => setPeriodDays(days)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${periodDays === days ? "bg-white text-myinder-navy shadow-sm" : "text-myinder-muted hover:text-myinder-navy"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-5 flex items-end gap-2">
            <CalendarDays size={18} className="mb-1 text-myinder-blue" />
            <p className="text-3xl font-bold leading-none tabular-nums text-myinder-navy">{registeredInPeriod}</p>
            <p className="text-sm text-myinder-muted">registered in {periodDays} days</p>
          </div>
          {hasRegistrationDates ? (
            <>
              <div
                className="grid h-40 items-end gap-2 border-b border-blue-100 pb-2"
                style={{ gridTemplateColumns: `repeat(${registrationBuckets.length}, minmax(0, 1fr))` }}
                role="img"
                aria-label={`New user registrations over the last ${periodDays} days`}
              >
                {registrationBuckets.map(({ label, count }) => (
                  <div key={label} className="flex h-full min-w-0 flex-col items-center justify-end gap-2" title={`${label}: ${count} ${count === 1 ? "user" : "users"}`}>
                    <span className="text-[11px] font-semibold tabular-nums text-myinder-muted">{count || ""}</span>
                    <div
                      className={`w-full max-w-10 rounded-t-md ${count ? "bg-myinder-blue" : "bg-blue-50"}`}
                      style={{ height: `${count ? Math.max(8, (count / maxRegistrationCount) * 100) : 4}%` }}
                    />
                  </div>
                ))}
              </div>
              <div
                className="mt-2 grid gap-2 text-center text-[10px] text-myinder-muted sm:text-xs"
                style={{ gridTemplateColumns: `repeat(${registrationBuckets.length}, minmax(0, 1fr))` }}
                aria-hidden="true"
              >
                {registrationBuckets.map(({ label }) => <span key={label}>{label}</span>)}
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-blue-50/70 px-4 py-8 text-center text-sm text-myinder-muted">
              Registration dates are not available for these users.
            </p>
          )}
          <p className="mt-4 text-xs leading-5 text-myinder-muted">
            This chart shows account registrations, not visits or active sessions.    </p>
        </article>
      </section>

      <div className="mb-4 mt-8">
        <h2 className="text-lg font-bold text-myinder-navy">Recently Saved Users</h2>
        <p className="mt-1 text-sm text-myinder-muted">A quick view of submitted campus community profiles.</p>
      </div>
      <DataTable users={users.slice(0, 6)} />
    </main>
  );
}

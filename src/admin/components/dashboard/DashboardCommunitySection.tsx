import { ArrowRight, ArrowUpRight, CalendarDays, GraduationCap, Image } from "lucide-react";
import { Link } from "react-router-dom";
import ColorfulIcon from "../ColorfulIcon";

export interface UniversityCount {
  name: string;
  count: number;
}

interface Props {
  universityCounts: UniversityCount[];
  studyAreaCount: number;
  imageCount: number;
  userCount: number;
}

export default function DashboardCommunitySection({
  universityCounts,
  studyAreaCount,
  imageCount,
  userCount,
}: Props) {
  const maxUniversityCount = Math.max(1, ...universityCounts.map(({ count }) => count));

  return (
    <section className="grid min-w-0 gap-5 xl:grid-cols-2">
      <article className="dashboard-reveal min-w-0 rounded-2xl border border-orange-100 bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-myinder-navy">Users by university</h2>
            <p className="mt-1 text-sm text-myinder-muted">Saved profiles grouped by university.</p>
          </div>
          <Link to="/admin/universities" aria-label="Manage universities" className="rounded-lg p-2 text-myinder-blue hover:bg-blue-50">
            <ArrowUpRight size={18} />
          </Link>
        </div>
        {universityCounts.length ? (
          <ul className="space-y-4">
            {universityCounts.map(({ name, count }) => (
              <li key={name}>
                <Link to="/admin/users" className="group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-myinder-blue">
                  <span className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-myinder-navy group-hover:text-myinder-blue" title={name}>{name}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-myinder-muted">{count}</span>
                  </span>
                  <span className="block h-2.5 overflow-hidden rounded-full bg-orange-50">
                    <span className="dashboard-chart-bar block h-full rounded-full bg-myinder-orange" style={{ width: `${(count / maxUniversityCount) * 100}%` }} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-sm text-myinder-muted">No university data available.</p>
        )}
      </article>

      <article className="dashboard-reveal min-w-0 rounded-2xl border border-orange-100 bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-myinder-navy">Community snapshot</h2>
            <p className="mt-1 text-sm text-myinder-muted">A quick view of community activity.</p>
          </div>
          <Link to="/admin/users" aria-label="View all users" className="rounded-lg p-2 text-myinder-blue hover:bg-blue-50">
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/admin/users" className="rounded-xl bg-orange-50 p-4 transition hover:bg-orange-100">
            <ColorfulIcon Icon={GraduationCap} tone="purple" size={19} />
            <p className="mt-3 text-2xl font-bold tabular-nums text-myinder-navy">{studyAreaCount}</p>
            <p className="mt-1 text-xs text-myinder-muted">Study areas</p>
          </Link>
          <Link to="/admin/users" className="rounded-xl bg-blue-50 p-4 transition hover:bg-blue-100">
            <ColorfulIcon Icon={Image} tone="blue" size={19} />
            <p className="mt-3 text-2xl font-bold tabular-nums text-myinder-navy">{imageCount.toLocaleString()}</p>
            <p className="mt-1 text-xs text-myinder-muted">Uploaded images</p>
          </Link>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-orange-50 px-4 py-3 text-sm text-myinder-muted">
          <CalendarDays size={16} className="text-myinder-orange" />
          {userCount.toLocaleString()} saved user profiles
        </div>
      </article>
    </section>
  );
}

import DataTable from "../DataTable";
import type { SavedUser } from "../../types/admin.types";
import { Link } from "react-router-dom";

export default function DashboardRecentUsers({ users }: { users: SavedUser[] }) {
  return (
    <section className="dashboard-reveal min-w-0">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-myinder-navy">Recently saved users</h2>
          <p className="mt-1 text-sm text-myinder-muted">A quick view of submitted campus community profiles.</p>
        </div>
        <Link to="/admin/users" className="shrink-0 text-sm font-semibold text-myinder-blue hover:underline">View all</Link>
      </div>
      <DataTable users={users.slice(0, 6)} />
    </section>
  );
}

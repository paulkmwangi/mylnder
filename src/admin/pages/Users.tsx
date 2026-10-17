import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { University, GraduationCap, Instagram } from "lucide-react";
import type { SavedUser } from "../types/admin.types";
import { useUsers } from "../hooks/useUsers";
import LoadingState from "../../components/shared/LoadingState";
import UserDetailsModal from "../components/UserDetailsModal";
import Pagination from "../components/Pagination";

type Context = { search: string };

export default function Users() {
  const { search } = useOutletContext<Context>();
  const { users, loading, error } = useUsers();
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<SavedUser | null>(null);
  const pageSize = 12;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => !term || `${user.name} ${user.university} ${user.major} ${user.instagram}`.toLowerCase().includes(term));
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <LoadingState label="Loading saved users..." />;
  if (error) return <p className="py-10 text-center text-red-600">{error}</p>;

  return (
    <>
      <main>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-myinder-navy sm:text-[34px]">Saved Users</h1>
            <p className="mt-0.5 text-sm text-myinder-muted sm:text-base">View all user data submitted through the campus community form.</p>
          </div>
          <p className="pb-1 text-sm font-medium text-myinder-muted">Total Users: {users.length}</p>
        </div>

        {visibleUsers.length ? <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 2xl:grid-cols-4">
          {visibleUsers.map((user) => (
            <button key={user.id} type="button" onClick={() => setSelectedUser(user)} className="min-w-0 rounded-xl border border-blue-100 bg-white p-4 text-left shadow-[0_1px_3px_rgba(40,90,150,0.025)] transition hover:border-blue-300 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              <div className="min-w-0">
                <h2 className="truncate pl-1 text-sm font-bold text-myinder-navy">{user.name}</h2>
                <p className="mt-2 flex min-w-0 items-center gap-2.5 text-xs text-myinder-muted sm:text-[13px]"><University size={17} className="shrink-0 text-myinder-blue"/><span className="truncate">{user.university}</span></p>
                <p className="mt-2 flex min-w-0 items-center gap-2.5 text-xs text-myinder-muted sm:text-[13px]"><GraduationCap size={17} className="shrink-0 text-myinder-blue"/><span className="truncate">{user.major}</span></p>
                <p className="mt-2 flex min-w-0 items-center gap-2.5 text-xs text-myinder-muted sm:text-[13px]"><Instagram size={17} className="shrink-0 text-pink-500"/><span className="truncate">{user.instagram}</span></p>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {user.images.slice(0, 3).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" loading="lazy" className="h-[64px] w-full rounded-md object-cover sm:h-[64px]"/> )}
                <div className="flex h-[64px] items-center justify-center rounded-md bg-blue-50 text-xs font-semibold text-myinder-blue">+{Math.max(0, user.images.length - 3)}</div>
              </div>
            </button>
          ))}
        </div> : <div className="rounded-xl border border-dashed border-blue-200 bg-white py-16 text-center text-sm text-slate-500">No users match your search.</div>}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-myinder-muted">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} users</p>
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage}/>
        </div>
      </main>
      <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)}/>
    </>
  );
}
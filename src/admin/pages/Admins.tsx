import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Eye, EyeOff, Plus, Pencil, RefreshCw, Search, Trash2, UserPlus, Users, X } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { createAdmin, deleteAdmin, getAdmins, updateAdmin, type AdminAccount } from "../services/adminAuthService";
import { useAdminAuthStore } from "../stores/adminAuthStore";

function formatDate(value?: string): string {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export default function Admins() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
const currentAdmin = useAdminAuthStore((state) => state.admin);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminAccount | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadAdmins = useCallback(async (refresh = false) => {
    if (!accessToken) {
      setListError("Your admin session has expired. Please sign in again.");
      setLoading(false);
      return;
    }

    if (refresh) setRefreshing(true);
    else setLoading(true);
    setListError("");
    try {
      setAdmins(await getAdmins(accessToken));
    } catch (cause: unknown) {
      setListError(cause instanceof Error ? cause.message : "Unable to load admins.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  const filteredAdmins = useMemo(() => {
    const term = search.trim().toLowerCase();
    return admins.filter((admin) =>
      !term || `${admin.name} ${admin.email}`.toLowerCase().includes(term),
    );
  }, [admins, search]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");
    setSuccess("");

    if (!name.trim() || name.length > 100) {
      setActionError("Name must contain non-whitespace text and be at most 100 characters.");
      return;
    }
    if (email.trim().length > 254) {
      setActionError("Email must be at most 254 characters.");
      return;
    }
    if (password.length < 12 || password.length > 128 || !password.trim()) {
      setActionError("Password must be 12–128 characters and cannot be all whitespace.");
      return;
    }
    if (!accessToken) {
      setActionError("Your admin session has expired. Please sign in again.");
      return;
    }

    setCreating(true);
    try {
      const created = await createAdmin({ name, email, password }, accessToken);
      setAdmins((current) => [created, ...current.filter((admin) => admin.id !== created.id)]);
      setName("");
      setEmail("");
      setPassword("");
      setSuccess(`Admin account created for ${created.email}.`);
    } catch (cause: unknown) {
      setActionError(cause instanceof Error ? cause.message : "Unable to add the admin.");
    } finally {
      setCreating(false);
    }
  }

  function startEditing(admin: AdminAccount) {
    setActionError("");
    setSuccess("");
    setEditing(admin);
    setEditName(admin.name);
    setEditEmail(admin.email);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");
    if (!editing) return;
    if (!editName.trim() || editName.length > 100) {
      setActionError("Name must contain non-whitespace text and be at most 100 characters.");
      return;
    }
    if (!editEmail.trim() || editEmail.trim().length > 254) {
      setActionError("Enter an email address of at most 254 characters.");
      return;
    }
    if (!accessToken) {
      setActionError("Your admin session has expired. Please sign in again.");
      return;
    }

    setSavingEdit(true);
    try {
      const changes = { name: editName.trim(), email: editEmail.trim() };
      const updated = await updateAdmin(editing.id, changes, accessToken);
      const result = updated ?? { ...editing, ...changes };
      setAdmins((current) => current.map((admin) => admin.id === editing.id ? result : admin));
      setSuccess(`Updated ${result.email}.`);
      setEditing(null);
    } catch (cause: unknown) {
      setActionError(cause instanceof Error ? cause.message : "Unable to update admin.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || !accessToken) {
      setActionError("Your admin session has expired. Please sign in again.");
      return;
    }

    setActionError("");
    setDeleting(true);
    try {
      await deleteAdmin(deleteTarget.id, accessToken);
      setAdmins((current) => current.filter((admin) => admin.id !== deleteTarget.id));
      setSuccess(`Deleted ${deleteTarget.email}.`);
      setDeleteTarget(null);
    } catch (cause: unknown) {
      setActionError(cause instanceof Error ? cause.message : "Unable to delete admin.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-myinder-blue">Administration</p>
          <h1 className="mt-2 text-2xl font-bold text-myinder-navy sm:text-3xl">Manage admins</h1>
          <p className="mt-2 text-sm text-myinder-muted">
            View administrator accounts, update their details, or remove access.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void loadAdmins(true)} disabled={refreshing}>
          <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh list"}
        </Button>
      </div>

      {actionError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>
      )}
      {success && (
        <p role="status" className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 size={18} />{success}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-myinder-blue">
              <Users size={20} />
            </span>
            <div>
              <h2 className="font-bold text-myinder-navy">Administrator accounts</h2>
              <p className="text-xs text-myinder-muted">{admins.length} total</p>
            </div>
          </div>
          <label className="relative block w-full sm:max-w-sm">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-myinder-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email"
              aria-label="Search admins"
              className="w-full rounded-xl border border-blue-100 bg-white py-2.5 pl-10 pr-3 text-sm text-myinder-navy outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
          </label>
        </div>

        {listError ? (
  <div
    role="alert"
    className="flex flex-col items-center justify-center px-6 py-12 text-center"
  >
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
      <X size={26} className="text-red-500" />
    </div>

    <h3 className="mt-4 text-lg font-bold text-myinder-navy">
      Unable to load administrators
    </h3>

    <p className="mt-2 max-w-md text-sm leading-6 text-myinder-muted">
      We couldn’t retrieve the administrator accounts right now.
      Please check your connection and try again.
    </p>

    

    <Button
      type="button"
      variant="secondary"
      onClick={() => void loadAdmins(true)}
      disabled={refreshing}
      className="mt-5"
    >
      <RefreshCw
        size={16}
        className={refreshing ? "animate-spin" : ""}
      />
      {refreshing ? "Trying again..." : "Try again"}
    </Button>
  </div>
) : loading ? (
  <p className="p-8 text-center text-sm text-myinder-muted">
    Loading administrators...
  </p>
) : filteredAdmins.length === 0 ? (
  <div className="p-10 text-center">
    <Users size={32} className="mx-auto text-slate-300" />
    <p className="mt-3 font-semibold text-myinder-navy">
      {admins.length
        ? "No admins match your search"
        : "No administrator accounts yet"}
    </p>
    <p className="mt-1 text-sm text-myinder-muted">
      {admins.length
        ? "Try another name or email address."
        : "Create an administrator account using the form below."}
    </p>
  </div>
) : (
  // Keep your existing table here.
  
<div className="overflow-x-auto">
  <table className="w-full min-w-[650px] text-left text-sm">
    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
      <tr>
        <th className="px-5 py-4">Administrator</th>
        <th className="px-5 py-4">Created</th>
        <th className="px-5 py-4 text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-blue-50">
      {filteredAdmins.map((admin) => {
        const isCurrentAdmin = currentAdmin?.id === admin.id;

        return (
          <tr key={admin.id} className="hover:bg-blue-50/40">
            <td className="px-5 py-4">
              <p className="font-semibold text-myinder-navy">
                {admin.name}
                {isCurrentAdmin && (
                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                    You
                  </span>
                )}
              </p>
              <p className="mt-1 text-myinder-muted">{admin.email}</p>
            </td>
            <td className="px-5 py-4 text-myinder-muted">
              {formatDate(
                "createdAt" in admin
                  ? String(admin.createdAt ?? "")
                  : undefined
              )}
            </td>
            <td className="px-5 py-4">
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => startEditing(admin)}
                  disabled={isCurrentAdmin}
                >
                  <Pencil size={15} />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setDeleteTarget(admin)}
                  disabled={isCurrentAdmin}
                >
                  <Trash2 size={15} />
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

)}
      </section>

      <form onSubmit={handleCreate} className="space-y-5 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3 border-b border-blue-50 pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-myinder-orange">
            <UserPlus size={22} />
          </div>
          <div>
            <h2 className="font-bold text-myinder-navy">Add an admin</h2>
            <p className="mt-1 text-sm text-myinder-muted">Create a new administrator account.</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="new-admin-name" className="mb-2 block text-sm font-semibold text-myinder-navy">Full name</label>
            <Input id="new-admin-name" type="text" autoComplete="name" maxLength={100} required value={name} onChange={(event) => setName(event.target.value)} placeholder="Site Administrator" />
          </div>
          <div>
            <label htmlFor="new-admin-email" className="mb-2 block text-sm font-semibold text-myinder-navy">Email address</label>
            <Input id="new-admin-email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" />
          </div>
          <div>
            <label htmlFor="new-admin-password" className="mb-2 block text-sm font-semibold text-myinder-navy">Password</label>
            <div className="relative">
              <Input id="new-admin-password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Use 12–128 characters" className="pr-12" />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-2 flex items-center justify-center rounded-lg px-2 text-myinder-muted transition hover:bg-blue-50 hover:text-myinder-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="mt-2 text-xs text-myinder-muted">Choose a password between 12 and 128 characters.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-blue-50 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-myinder-muted">Passwords are not saved or returned by this dashboard.</p>
          <Button type="submit" disabled={creating}>
            <Plus size={17} />{creating ? "Creating admin..." : "Create admin"}
          </Button>
        </div>
      </form>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingEdit) setEditing(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="edit-admin-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="edit-admin-title" className="text-lg font-bold text-myinder-navy">Edit admin</h2>
              <button type="button" onClick={() => setEditing(null)} disabled={savingEdit} aria-label="Close edit admin" className="rounded-lg p-2 text-myinder-muted hover:bg-blue-50 disabled:opacity-50">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label htmlFor="edit-admin-name" className="mb-2 block text-sm font-semibold text-myinder-navy">Name</label>
                <Input id="edit-admin-name" type="text" maxLength={100} required value={editName} onChange={(event) => setEditName(event.target.value)} />
              </div>
              <div>
                <label htmlFor="edit-admin-email" className="mb-2 block text-sm font-semibold text-myinder-navy">Email</label>
                <Input id="edit-admin-email" type="email" maxLength={254} required value={editEmail} onChange={(event) => setEditEmail(event.target.value)} />
              </div>
              {actionError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setEditing(null)} disabled={savingEdit}>Cancel</Button>
                <Button type="submit" disabled={savingEdit}>{savingEdit ? "Saving..." : "Save changes"}</Button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog title="Delete admin?" onClose={() => { if (!deleting) setDeleteTarget(null); }}>
          <p className="text-sm text-myinder-muted">
            This will permanently remove <span className="font-semibold text-myinder-navy">{deleteTarget.email}</span> from the admin accounts.
          </p>
          {actionError && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button onClick={() => void handleDelete()} disabled={deleting} className="bg-rose-600 hover:bg-rose-700">
              <Trash2 size={16} />{deleting ? "Deleting..." : "Delete admin"}
            </Button>
          </div>
        </ConfirmDialog>
      )}
    </section>
  );
}

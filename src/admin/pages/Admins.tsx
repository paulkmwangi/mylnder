import { useState, type FormEvent } from "react";
import { CheckCircle2, UserPlus } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { createAdmin, type AdminAccount } from "../services/adminAuthService";
import { useAdminAuthStore } from "../stores/adminAuthStore";

export default function Admins() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createdAdmin, setCreatedAdmin] = useState<AdminAccount | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCreatedAdmin(null);

    if (!name.trim() || name.length > 100) {
      setError("Name must contain non-whitespace text and be at most 100 characters.");
      return;
    }
    if (email.trim().length > 254) {
      setError("Email must be at most 254 characters.");
      return;
    }
    if (password.length < 12 || password.length > 128 || !password.trim()) {
      setError("Password must be 12–128 characters and cannot be all whitespace.");
      return;
    }

    setSubmitting(true);

    try {
      if (!accessToken) throw new Error("Your admin session has expired. Please sign in again.");
      const admin = await createAdmin({ name, email, password }, accessToken);
      setCreatedAdmin(admin);
      setName("");
      setEmail("");
      setPassword("");
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Unable to add the admin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-myinder-blue">Administration</p>
        <h1 className="mt-2 text-2xl font-bold text-myinder-navy sm:text-3xl">Add an admin</h1>
        <p className="mt-2 text-sm text-myinder-muted">
          Create a new administrator account for the dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3 border-b border-blue-50 pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-myinder-orange">
            <UserPlus size={22} />
          </div>
          <div>
            <h2 className="font-bold text-myinder-navy">Administrator details</h2>
            <p className="mt-1 text-sm text-myinder-muted">All fields are required.</p>
          </div>
        </div>

        <div>
          <label htmlFor="new-admin-name" className="mb-2 block text-sm font-semibold text-myinder-navy">
            Full name
          </label>
          <Input
            id="new-admin-name"
            type="text"
            autoComplete="name"
            maxLength={100}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Site Administrator"
          />
        </div>

        <div>
          <label htmlFor="new-admin-email" className="mb-2 block text-sm font-semibold text-myinder-navy">
            Email address
          </label>
          <Input
            id="new-admin-email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label htmlFor="new-admin-password" className="mb-2 block text-sm font-semibold text-myinder-navy">
            Password
          </label>
          <Input
            id="new-admin-password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Use 12–128 characters"
          />
          <p className="mt-2 text-xs text-myinder-muted">Choose a password between 12 and 128 characters.</p>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {createdAdmin && (
          <p role="status" className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            <CheckCircle2 size={18} />
            Admin account created for {createdAdmin.email}.
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-blue-50 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-myinder-muted">Passwords are sent to the configured API and are not saved by this dashboard.</p>
          <Button type="submit" disabled={submitting}>
            <UserPlus size={17} />
            {submitting ? "Creating admin..." : "Create admin"}
          </Button>
        </div>
      </form>
    </section>
  );
}

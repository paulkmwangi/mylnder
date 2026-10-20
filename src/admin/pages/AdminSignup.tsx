import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, UserPlus } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Logo from "../../components/shared/Logo";
import { createAdmin, type AdminAccount } from "../services/adminAuthService";
import { useAdminAuthStore } from "../stores/adminAuthStore";

export default function AdminSignup() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const expiresAt = useAdminAuthStore((state) => state.expiresAt);
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
      const validAccessToken =
        accessToken && expiresAt !== null && expiresAt > Date.now()
          ? accessToken
          : undefined;
      const admin = await createAdmin(
        { name, email, password },
        validAccessToken,
      );
      setCreatedAdmin(admin);
      setName("");
      setEmail("");
      setPassword("");
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Unable to create the admin account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fbff] px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        {createdAdmin ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
              <CheckCircle2 size={24} />
            </div>
            <h1 className="text-2xl font-bold text-myinder-navy">Admin account created</h1>
            <p role="status" className="mt-3 text-sm text-myinder-muted">
              The account for <span className="font-semibold text-myinder-navy">{createdAdmin.email}</span> is ready. You can sign in now.
            </p>
            <Link
              to="/admin/login"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-myinder-orange px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-myinder-blue">
                <UserPlus size={22} />
              </div>
              <h1 className="text-2xl font-bold text-myinder-navy">Create an admin</h1>
              <p className="mt-2 text-sm text-myinder-muted">
                Register an administrator account for the dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="signup-admin-name" className="mb-2 block text-sm font-semibold text-myinder-navy">
                  Full name
                </label>
                <Input
                  id="signup-admin-name"
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
                <label htmlFor="signup-admin-email" className="mb-2 block text-sm font-semibold text-myinder-navy">
                  Email address
                </label>
                <Input
                  id="signup-admin-email"
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
                <label htmlFor="signup-admin-password" className="mb-2 block text-sm font-semibold text-myinder-navy">
                  Password
                </label>
                <Input
                  id="signup-admin-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={128}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Use 12–128 characters"
                />
                <p className="mt-2 text-xs text-myinder-muted">
                  Passwords must be 12–128 characters and cannot be all whitespace.
                </p>
              </div>
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-900">
                Admin creation is public on the documented backend. If this server requires authentication, sign in with an existing admin account first.
              </p>
              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={submitting} className="w-full py-3">
                {submitting ? "Creating account..." : "Create admin account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-myinder-muted">
              Already have an account?{" "}
              <Link to="/admin/login" className="font-semibold text-myinder-blue hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}

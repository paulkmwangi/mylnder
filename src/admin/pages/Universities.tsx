
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  LoaderCircle,
  Plus,
  RefreshCw,
  University as UniversityIcon,
  X,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingState from "../../components/shared/LoadingState";
import Modal from "../../components/ui/Modal";

import {
  createUniversity,
  getUniversities,
  type UniversityRecord,
} from "../services/universitiesService";

import ColorfulIcon from "../components/ColorfulIcon";

export default function Universities() {
  const [universities, setUniversities] = useState<UniversityRecord[]>([]);
  const [name, setName] = useState("");
  const [profileName, setProfileName] = useState("");
  const [customColor, setCustomColor] = useState("#00E6B3");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUniversities = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setUniversities(await getUniversities());
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load universities."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUniversities();
  }, [loadUniversities]);

  useEffect(() => {
    if (!error) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setError("");
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [error]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const universityName = name.trim();
    const universityProfileName = profileName.trim();
    const universityCustomColor = customColor.trim();

    if (!universityName) {
      setError("Enter a university name.");
      return;
    }

    if (universityName.length > 150) {
      setError("The university name must be 150 characters or fewer.");
      return;
    }

    if (!universityProfileName) {
      setError("Enter a university profile name.");
      return;
    }

    if (universityProfileName.length > 100) {
      setError(
        "The university profile name must be 100 characters or fewer."
      );
      return;
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(universityCustomColor)) {
      setError("Choose a valid six-digit hex color.");
      return;
    }

    const alreadyExists = universities.some(
      (university) =>
        university.name.toLocaleLowerCase() ===
        universityName.toLocaleLowerCase()
    );

    if (alreadyExists) {
      setError("That university is already in the list.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createUniversity(
        universityName,
        universityProfileName,
        universityCustomColor
      );

      setName("");
      setProfileName("");
      setCustomColor("#00E6B3");

      setSuccess(`${universityName} was added.`);

      await loadUniversities();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to add the university."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl">
      <div className="mb-7">
        <h1 className="text-3xl font-extrabold tracking-tight text-myinder-navy">
          Universities
        </h1>

        <p className="mt-1 text-sm text-myinder-muted">
          Manage the universities available in the campus community.
        </p>
      </div>

      <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-myinder-navy">
          Add a university
        </h2>

        <form
          noValidate
          onSubmit={submit}
          className="mt-4 grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label
              htmlFor="university-name"
              className="mb-2 block text-sm font-semibold text-myinder-navy"
            >
              University name
            </label>

            <Input
              id="university-name"
              name="name"
              autoComplete="organization"
              maxLength={150}
              required
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
                setSuccess("");
              }}
              placeholder="Enter university name"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="university-profile-name"
              className="mb-2 block text-sm font-semibold text-myinder-navy"
            >
              Profile name
            </label>

            <Input
              id="university-profile-name"
              name="profile_name"
              autoComplete="organization"
              maxLength={100}
              required
              value={profileName}
              onChange={(event) => {
                setProfileName(event.target.value);
                setError("");
                setSuccess("");
              }}
              placeholder="Enter university profile name"
            />
          </div>

          <div>
            <label
              htmlFor="university-custom-color"
              className="mb-2 block text-sm font-semibold text-myinder-navy"
            >
              Profile color
            </label>

           <div className="flex items-center gap-3">
  <input
    id="university-custom-color"
    name="custom_color"
    type="color"
    required
    value={customColor}
    onChange={(event) => {
      setCustomColor(event.target.value);
      setError("");
      setSuccess("");
    }}
    aria-label="Profile color picker"
    className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
  />

  <input
    type="text"
    value={customColor}
    onChange={(event) => {
      const value = event.target.value;

      setCustomColor(value);
      setError("");
      setSuccess("");
    }}
    placeholder="#102A43"
    aria-label="Enter HEX color code"
    maxLength={7}
    pattern="^#[0-9A-Fa-f]{6}$"
    title="Enter a valid HEX color code, e.g. #102A43"
    className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
  />

  <span className="text-sm text-gray-500">
    Choose or enter a color
  </span>
</div>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="sm:col-span-2 sm:justify-self-start"
          >
            {saving ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}

            {saving ? "Adding..." : "Add university"}
          </Button>
        </form>

        {success && (
          <p
            role="status"
            className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700"
          >
            {success}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-myinder-navy">
              All universities
            </h2>

            <p className="mt-1 text-sm text-myinder-muted">
              {universities.length}{" "}
              {universities.length === 1
                ? "university"
                : "universities"}
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => void loadUniversities()}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </Button>
        </div>

        {loading ? (
          <LoadingState label="Loading universities..." />
        ) : universities.length ? (
          <ul className="divide-y divide-blue-50">
            {universities.map((university) => (
              <li
                key={university.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <ColorfulIcon
                  Icon={UniversityIcon}
                  tone="orange"
                  size={20}
                  className="h-10 w-10"
                />

             <span className="font-medium text-myinder-navy">
  {university.name}
  {university.profileName
    ? ` (${university.profileName})`
    : ""}
</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 py-10 text-center text-sm text-myinder-muted">
            {error
              ? "Universities could not be loaded. Try refreshing the list."
              : "No universities have been added yet."}
          </div>
        )}
      </section>

      {error && (
        <Modal>
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="university-error-title"
            aria-describedby="university-error-message"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle size={22} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h2
                    id="university-error-title"
                    className="text-lg font-bold text-myinder-navy"
                  >
                    Unable to complete the request
                  </h2>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    aria-label="Close error message"
                    className="rounded-lg p-1 text-myinder-muted hover:bg-blue-50 hover:text-myinder-navy"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p
                  id="university-error-message"
                  className="mt-2 break-words text-sm leading-6 text-slate-600"
                >
                  {error}
                </p>

                <Button
                  type="button"
                  onClick={() => setError("")}
                  className="mt-5"
                >
                  OK
                </Button>
              </div>
            </div>
          </section>
        </Modal>
      )}
    </main>
  );
}

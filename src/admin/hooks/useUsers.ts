import { useEffect, useState } from "react";
import { getUsers } from "../services/usersService";
import type { SavedUser } from "../types/admin.types";

export function useUsers() {
  const [users, setUsers] = useState<SavedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getUsers()
      .then((data) => { if (alive) setUsers(data); })
      .catch((cause: unknown) => {
        if (alive) {
          setError(cause instanceof Error ? cause.message : "Unable to load users.");
        }
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return { users, loading, error };
}
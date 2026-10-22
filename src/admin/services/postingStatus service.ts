
import { useAdminAuthStore } from "../stores/adminAuthStore";

const API_ORIGIN = import.meta.env.VITE_ADMIN_API_ORIGIN;
const USERS_API_PATH = import.meta.env.VITE_ADMIN_USERS_API_URL;

export async function updatePostingStatus(
  userId: string,
  isPosted: boolean,
): Promise<{ is_posted: boolean }> {
  const auth = useAdminAuthStore.getState();

  if (!auth.accessToken) {
    throw new Error(
      "Admin authentication is required. Please sign in again.",
    );
  }

  if (!API_ORIGIN || !USERS_API_PATH) {
    throw new Error(
      "Admin API configuration is missing. Check your environment variables.",
    );
  }

  const baseUrl = `${API_ORIGIN.replace(/\/+$/, "")}/${USERS_API_PATH
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")}`;

  const response = await fetch(
    `${baseUrl}/${encodeURIComponent(userId)}/posting-status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_posted: isPosted }),
    },
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || `Failed to update posting status (${response.status}).`,
    );
  }

  return response.json();
}

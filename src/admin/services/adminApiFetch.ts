import { useAdminAuthStore } from "../stores/adminAuthStore";

export function adminApiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const auth = useAdminAuthStore.getState();
  const expired =
    Boolean(auth.accessToken) &&
    (auth.expiresAt === null || auth.expiresAt <= Date.now());
  if (expired) auth.signOut();

  const accessToken =
    !expired && auth.expiresAt !== null && auth.expiresAt > Date.now()
      ? auth.accessToken
      : null;

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(input, { ...init, headers }).then((response) => {
    if (response.status === 401 && accessToken) {
      useAdminAuthStore.getState().signOut();
    }
    return response;
  });
}

import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";

const DATABASE_NAME = "mylnder-query-cache";
const STORE_NAME = "persisted-clients";
const CACHE_KEY_PREFIX = "admin-user-images:";

let databasePromise: Promise<IDBDatabase> | undefined;
const storageOperations = new Map<string, Promise<void>>();

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is unavailable."));
  }

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Unable to open the query cache database."));
    request.onblocked = () => reject(new Error("The query cache database is blocked."));
  });

  return databasePromise;
}

function storageKey(adminId: string): string {
  return `${CACHE_KEY_PREFIX}${adminId}`;
}

function serializeStorageOperation(
  key: string,
  operation: () => Promise<void>,
): Promise<void> {
  const previous = storageOperations.get(key) ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(operation);
  storageOperations.set(key, current);
  void current.then(
    () => {
      if (storageOperations.get(key) === current) storageOperations.delete(key);
    },
    () => {
      if (storageOperations.get(key) === current) storageOperations.delete(key);
    },
  );
  return current;
}

export function createImageQueryPersister(adminId: string): Persister {
  const key = storageKey(adminId);

  return {
    persistClient(client) {
      return serializeStorageOperation(key, async () => {
        const database = await openDatabase();
        await new Promise<void>((resolve, reject) => {
          const transaction = database.transaction(STORE_NAME, "readwrite");
          transaction.objectStore(STORE_NAME).put(client, key);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () =>
            reject(transaction.error ?? new Error("Unable to persist image queries."));
          transaction.onabort = () =>
            reject(transaction.error ?? new Error("Image query persistence was aborted."));
        });
      });
    },
    async restoreClient() {
      const database = await openDatabase();
      return new Promise<PersistedClient | undefined>((resolve, reject) => {
        const request = database
          .transaction(STORE_NAME, "readonly")
          .objectStore(STORE_NAME)
          .get(key);
        request.onsuccess = () =>
          resolve(request.result as PersistedClient | undefined);
        request.onerror = () =>
          reject(request.error ?? new Error("Unable to restore image queries."));
      });
    },
    removeClient() {
      return serializeStorageOperation(key, async () => {
        const database = await openDatabase();
        await new Promise<void>((resolve, reject) => {
          const transaction = database.transaction(STORE_NAME, "readwrite");
          transaction.objectStore(STORE_NAME).delete(key);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () =>
            reject(transaction.error ?? new Error("Unable to remove persisted image queries."));
          transaction.onabort = () =>
            reject(transaction.error ?? new Error("Removing persisted image queries was aborted."));
        });
      });
    },
  };
}

export async function clearPersistedImageQueries(adminId: string): Promise<void> {
  const key = storageKey(adminId);
  await serializeStorageOperation(key, async () => {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Unable to clear persisted image queries."));
      transaction.onabort = () =>
        reject(transaction.error ?? new Error("Clearing persisted image queries was aborted."));
    });
  });
}

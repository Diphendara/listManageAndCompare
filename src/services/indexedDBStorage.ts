/**
 * IndexedDB FileSystemAdapter for persistent browser storage.
 * Uses IndexedDB for reliable, scalable client-side storage.
 */

import type { FileSystemAdapter } from "./storageService";

const DB_NAME = "ListManageAndCompare";
const DB_VERSION = 1;
const STORE_NAME = "files";

interface FileRecord {
  path: string;
  content: string;
  timestamp: number;
}

let dbInstance: IDBDatabase | null = null;

/**
 * Opens the IndexedDB database.
 */
async function getDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "path" });
      }
    };
  });
}

/**
 * Creates an IndexedDB-backed FileSystemAdapter.
 */
export function createIndexedDBAdapter(): FileSystemAdapter {
  return {
    async readFile(path: string): Promise<string> {
      const db = await getDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(path);

        request.onerror = () => {
          reject(new Error(`Failed to read file: ${path}`));
        };

        request.onsuccess = () => {
          const record = request.result as FileRecord | undefined;
          if (!record) {
            reject(new Error(`File not found: ${path}`));
          } else {
            resolve(record.content);
          }
        };
      });
    },

    async writeFile(path: string, content: string): Promise<void> {
      const db = await getDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const record: FileRecord = {
          path,
          content,
          timestamp: Date.now(),
        };

        const request = store.put(record);

        request.onerror = () => {
          reject(new Error(`Failed to write file: ${path}`));
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    },

    async rename(oldPath: string, newPath: string): Promise<void> {
      const db = await getDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        // Get the old file
        const getRequest = store.get(oldPath);

        getRequest.onerror = () => {
          reject(new Error(`Failed to rename file: ${oldPath}`));
        };

        getRequest.onsuccess = () => {
          const record = getRequest.result as FileRecord | undefined;
          if (!record) {
            reject(new Error(`File not found: ${oldPath}`));
            return;
          }

          // Create new record with new path
          const newRecord: FileRecord = {
            ...record,
            path: newPath,
          };

          // Put the new record
          const putRequest = store.put(newRecord);

          putRequest.onerror = () => {
            reject(new Error(`Failed to rename file: ${oldPath}`));
          };

          putRequest.onsuccess = () => {
            // Delete the old record
            const deleteRequest = store.delete(oldPath);

            deleteRequest.onerror = () => {
              reject(new Error(`Failed to delete old file: ${oldPath}`));
            };

            deleteRequest.onsuccess = () => {
              resolve();
            };
          };
        };
      });
    },
  };
}

/**
 * Lists all files matching a pattern in IndexedDB.
 * Useful for finding backups for cleanup.
 */
export async function listFiles(pattern: RegExp): Promise<string[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      reject(new Error("Failed to list files"));
    };

    request.onsuccess = () => {
      const records = request.result as FileRecord[];
      const matching = records
        .filter((r) => pattern.test(r.path))
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((r) => r.path);
      resolve(matching);
    };
  });
}

/**
 * Deletes a file from IndexedDB.
 */
export async function deleteFile(path: string): Promise<void> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(path);

    request.onerror = () => {
      reject(new Error(`Failed to delete file: ${path}`));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

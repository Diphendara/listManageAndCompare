/**
 * In-memory FileSystemAdapter for web / development when real file system is not available.
 */

import type { FileSystemAdapter } from "./storageService";

export function createInMemoryAdapter(): FileSystemAdapter {
  const store = new Map<string, string>();

  return {
    async readFile(path: string): Promise<string> {
      const content = store.get(path);
      if (content === undefined) {
        throw new Error(`File not found: ${path}`);
      }
      return content;
    },

    async writeFile(path: string, content: string): Promise<void> {
      store.set(path, content);
    },

    async rename(oldPath: string, newPath: string): Promise<void> {
      const content = store.get(oldPath);
      if (content === undefined) {
        throw new Error(`File not found: ${oldPath}`);
      }
      store.set(newPath, content);
      store.delete(oldPath);
    },
  };
}

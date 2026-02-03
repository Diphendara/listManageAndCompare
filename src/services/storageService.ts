/**
 * Low-level JSON file storage per specs.md §11 (Persistence Rules).
 * - Atomic read → modify → write
 * - Human-readable JSON
 * - No concurrency assumptions
 */

/** Adapter for file system access (Node fs, React Native, or in-memory for tests). */
export interface FileSystemAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
}

/** Result of storageService: readJson and writeJson by relative path. */
export interface StorageService {
  readJson<T>(relativePath: string): Promise<T>;
  writeJson(relativePath: string, data: unknown): Promise<void>;
}

const JSON_INDENT = 2;

/**
 * Builds full path from base and relative. Uses "/" so it works cross-platform for logical paths.
 */
function joinPath(basePath: string, relativePath: string): string {
  if (!basePath) return relativePath;
  const base = basePath.replace(/\/$/, "");
  return relativePath ? `${base}/${relativePath}` : base;
}

/**
 * Creates a storage service: atomic write (temp file + rename), human-readable JSON (§11).
 */
export function createStorageService(
  adapter: FileSystemAdapter,
  basePath: string
): StorageService {
  function fullPath(relativePath: string): string {
    return joinPath(basePath, relativePath);
  }

  return {
    async readJson<T>(relativePath: string): Promise<T> {
      const path = fullPath(relativePath);
      const content = await adapter.readFile(path);
      return JSON.parse(content) as T;
    },

    async writeJson(relativePath: string, data: unknown): Promise<void> {
      const path = fullPath(relativePath);
      const content = JSON.stringify(data, null, JSON_INDENT);
      const tmpPath = `${path}.tmp`;
      await adapter.writeFile(tmpPath, content);
      await adapter.rename(tmpPath, path);
    },
  };
}

/**
 * Settings service for managing application configuration.
 */

import type { AppSettings } from "../models/AppSettings";
import { DEFAULT_SETTINGS } from "../models/AppSettings";
import type { StorageService } from "./storageService";

const SETTINGS_FILENAME = "app_settings.json";

export interface SettingsService {
  loadSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
}

/**
 * Creates the settings service.
 */
export function createSettingsService(storage: StorageService): SettingsService {
  return {
    async loadSettings(): Promise<AppSettings> {
      try {
        return await storage.readJson<AppSettings>(SETTINGS_FILENAME);
      } catch {
        // Return defaults if file doesn't exist
        return { ...DEFAULT_SETTINGS };
      }
    },

    async saveSettings(settings: AppSettings): Promise<void> {
      await storage.writeJson(SETTINGS_FILENAME, settings);
    },
  };
}

/**
 * Settings model for application configuration.
 */

export interface AppSettings {
  maxBackupsPerDay: number; // Default: 10
}

export const DEFAULT_SETTINGS: AppSettings = {
  maxBackupsPerDay: 10,
};

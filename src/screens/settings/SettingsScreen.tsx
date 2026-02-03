import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import type { AppSettings } from "../../models/AppSettings";
import type { StorageService } from "../../services/storageService";
import type { InventoryService } from "../../services/inventoryService";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { createSettingsService } from "../../services/settingsService";
import { listFiles, deleteFile } from "../../services/indexedDBStorage";
import { getBackupDateString } from "../../utils/dateUtils";

export interface SettingsScreenProps {
  storageService: StorageService;
  inventoryService: InventoryService;
  onClose: () => void;
  onDataChanged?: () => void;
}

/**
 * Settings screen for managing application configuration.
 * Includes: Backup management, import/export, and statistics.
 */
export function SettingsScreen({
  storageService,
  inventoryService,
  onClose,
  onDataChanged,
}: SettingsScreenProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [maxBackups, setMaxBackups] = useState("10");
  const [backupStats, setBackupStats] = useState<{
    totalBackups: number;
    todayBackups: number;
  }>({ totalBackups: 0, todayBackups: 0 });
  const [backupFiles, setBackupFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedBackup, setExpandedBackup] = useState<string | null>(null);
  const [expandedCleanOption, setExpandedCleanOption] = useState<string | null>(null);

  // Load current settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const settingsService = createSettingsService(storageService);
        const currentSettings = await settingsService.loadSettings();
        setSettings(currentSettings);
        setMaxBackups(currentSettings.maxBackupsPerDay.toString());
        await loadBackupStats();
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    loadSettings();
  }, []);

  /**
   * Loads backup statistics: total backups and today's backups.
   */
  async function loadBackupStats() {
    try {
      // Check if inventory.json exists
      const inventoryFiles: string[] = [];
      try {
        await storageService.readJson<unknown>("inventory.json");
        inventoryFiles.push("inventory.json");
      } catch {
        // inventory.json doesn't exist, that's okay
      }
      
      // Get all backups sorted by newest first
      const allBackups = await listFiles(/inventory_backup_.+\.json$/);
      const sortedBackups = allBackups.sort().reverse();
      
      // Combine: inventory.json first (if it exists), then backups
      const combined = [...inventoryFiles, ...sortedBackups];
      setBackupFiles(combined);
      
      // Get today's backups
      const today = getBackupDateString(new Date()).substring(0, 8);
      const todayPattern = new RegExp(`inventory_backup_${today}_.+\\.json$`);
      const todayBackups = await listFiles(todayPattern);

      setBackupStats({
        totalBackups: allBackups.length + inventoryFiles.length,
        todayBackups: todayBackups.length,
      });
    } catch (err) {
      console.error("Failed to load backup stats:", err);
    }
  }

  /**
   * Saves the new max backups per day setting.
   */
  async function handleSaveSettings() {
    try {
      setLoading(true);
      const newMaxBackups = parseInt(maxBackups, 10);

      if (isNaN(newMaxBackups) || newMaxBackups < 1) {
        Alert.alert("Invalid Input", "Max backups must be a number >= 1");
        return;
      }

      const newSettings: AppSettings = {
        maxBackupsPerDay: newMaxBackups,
      };

      const settingsService = createSettingsService(storageService);
      await settingsService.saveSettings(newSettings);
      setSettings(newSettings);
      Alert.alert("Success", `Max backups per day set to ${newMaxBackups}`);
    } catch (err) {
      Alert.alert("Error", "Failed to save settings");
      console.error("Failed to save settings:", err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Exports the current inventory and all backups as a JSON file.
   */
  async function handleExportBackups() {
    try {
      setLoading(true);
      const inventory = await inventoryService.loadInventory();
      const allBackups = await listFiles(/inventory_backup_.+\.json$/);

      const backupData = {
        exportDate: new Date().toISOString(),
        currentInventory: inventory,
        backupFileNames: allBackups,
      };

      // Create a data URL for download
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      // Trigger download
      const exportFileDefaultName = `inventory_export_${Date.now()}.json`;
      const link = document.createElement("a");
      link.setAttribute("href", dataUri);
      link.setAttribute("download", exportFileDefaultName);
      link.click();

      Alert.alert("Success", "Backups exported successfully");
    } catch (err) {
      Alert.alert("Error", "Failed to export backups");
      console.error("Failed to export backups:", err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Parses backup filename to extract date/time.
   * Format: inventory_backup_DD_MM_YY_HH_MM.json
   * Returns: "DD-MM-YYYY HH:MM"
   */
  function parseBackupDate(filename: string): string {
    const match = filename.match(/inventory_backup_(\d{2})_(\d{2})_(\d{2})_(\d{2})_(\d{2})\.json/);
    if (!match) return "Unknown date";
    
    const [, day, month, year, hour, minute] = match;
    const fullYear = `20${year}`;
    return `${day}-${month}-${fullYear} ${hour}:${minute}`;
  }

  /**
   * Toggles the expanded state for a backup (shows/hides delete confirmation).
   */
  function handleToggleBackupExpand(filename: string) {
    setExpandedBackup(expandedBackup === filename ? null : filename);
  }

  /**
   * Confirms deletion of a specific backup file.
   * If deleting inventory.json, promotes the next backup to be the main file.
   */
  async function handleConfirmDeleteBackup(filename: string) {
    try {
      setLoading(true);

      // If deleting inventory.json, promote the next backup
      if (filename === "inventory.json") {
        const nextBackup = backupFiles.find((f) => f !== "inventory.json");
        if (nextBackup) {
          // Copy the next backup to inventory.json
          const backupContent = await storageService.readJson<unknown>(nextBackup);
          await storageService.writeJson("inventory.json", backupContent);
        }
      }

      // Delete the file
      await deleteFile(filename);
      await loadBackupStats();
      setExpandedBackup(null);
    } catch (err) {
      Alert.alert("❌ Error", "No se pudo eliminar el backup");
      console.error("Failed to delete backup:", err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Downloads a specific backup file.
   */
  async function handleDownloadBackup(filename: string) {
    try {
      setLoading(true);
      const backup = await storageService.readJson<unknown>(filename);
      
      const dataStr = JSON.stringify(backup, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const link = document.createElement("a");
      link.setAttribute("href", dataUri);
      link.setAttribute("download", filename);
      link.click();

      Alert.alert("Success", `Downloaded ${filename}`);
    } catch (err) {
      Alert.alert("Error", "Failed to download backup");
      console.error("Failed to download backup:", err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Toggles expanded state for clean options.
   */
  function handleToggleCleanOption(option: string) {
    setExpandedCleanOption(expandedCleanOption === option ? null : option);
  }

  /**
   * Confirms deletion of all backups.
   */
  async function handleConfirmDeleteAllBackups() {
    try {
      setLoading(true);
      const allBackups = await listFiles(/inventory_backup_.+\.json$/);

      for (const backup of allBackups) {
        await deleteFile(backup);
      }

      await loadBackupStats();
      setExpandedCleanOption(null);
      
      // Notify parent components that data has changed
      if (onDataChanged) {
        onDataChanged();
      }
      
      Alert.alert("✓ Éxito", `Se eliminaron ${allBackups.length} backup(s)`);
    } catch (err) {
      Alert.alert("❌ Error", "No se pudieron eliminar los backups");
      console.error("Failed to delete backups:", err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Confirms deletion of all backups and inventory.
   */
  async function handleConfirmDeleteAllBackupsAndInventory() {
    try {
      setLoading(true);
      const allBackups = await listFiles(/inventory_backup_.+\.json$/);

      // Delete all backups
      for (const backup of allBackups) {
        try {
          await deleteFile(backup);
        } catch (err) {
          console.error(`Failed to delete backup ${backup}:`, err);
        }
      }

      // Delete inventory.json - this is critical
      try {
        await deleteFile("inventory.json");
      } catch (err) {
        console.error("Failed to delete inventory.json:", err);
        throw new Error("No se pudo eliminar el inventory.json");
      }

      // Reload stats to reflect changes
      await loadBackupStats();
      setExpandedCleanOption(null);
      
      // Notify parent components that data has changed
      if (onDataChanged) {
        onDataChanged();
      }
      
      Alert.alert("✓ Completado", "Se eliminaron todos los datos del inventario y los backups");
    } catch (err) {
      Alert.alert("❌ Error", `${err instanceof Error ? err.message : "No se pudieron eliminar los datos"}`);
      console.error("Failed to delete all data:", err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Placeholder for deleting all saved lists (not implemented yet).
   */
  async function handleConfirmDeleteAllLists() {
    try {
      setLoading(true);

      // Find all .json files and filter list files (exclude inventory and backups and system files)
      const allFiles = await listFiles(/\.json$/);
      const candidateListFiles = allFiles.filter(
        (f) =>
          f !== "inventory.json" &&
          f !== "listasEnUso.json" &&
          !f.startsWith("inventory_backup_")
      );

      let deleted = 0;
      for (const file of candidateListFiles) {
        try {
          // Verify structure looks like a CustomList
          const content = await storageService.readJson<any>(file);
          if (content && typeof content.name === "string" && Array.isArray(content.decklist)) {
            await deleteFile(file);
            deleted++;
          }
        } catch (err) {
          // skip non-list files or read errors
          console.error(`Skipping file ${file}:`, err);
        }
      }

      // Remove listasEnUso.json if exists
      try {
        const listsInUse = await storageService.readJson<any>("listasEnUso.json");
        if (listsInUse) {
          await deleteFile("listasEnUso.json");
        }
      } catch {
        // ignore
      }

      await loadBackupStats();
      setExpandedCleanOption(null);

      // Notify parent components that data has changed (Lists view should refresh)
      if (onDataChanged) onDataChanged();

      Alert.alert("✓ Éxito", `Se eliminaron ${deleted} lista(s)`);
    } catch (err) {
      Alert.alert("❌ Error", "No se pudieron eliminar las listas");
      console.error("Failed to delete all lists:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Settings</Text>
        <Button title="Close" onPress={onClose} />
      </View>

      {/* Backup Management Section */}
      <View style={styles.cardContainer}>
        <Card>
          <Text style={styles.cardTitle}>⚙️ Backup Management</Text>
          <View style={styles.section}>
            <Text style={styles.label}>Max Backups Per Day:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter number"
              value={maxBackups}
              onChangeText={setMaxBackups}
              keyboardType="numeric"
              editable={!loading}
            />
            <Button
              title="Save Settings"
              onPress={handleSaveSettings}
              disabled={loading}
            />
          </View>

          <View style={styles.divider} />
        </Card>
      </View>

      {/* Clean All Data Section */}
      <View style={styles.cardContainer}>
        <Card>
          <Text style={styles.cardTitle}>🗑️ Limpiar todos los datos</Text>

          {/* Option 1: Delete all backups */}
          <View style={styles.cleanDataOptionContainer}>
            <Pressable
              style={styles.cleanDataOptionButton}
              onPress={() => handleToggleCleanOption("backups")}
              disabled={loading}
            >
              <Text style={styles.cleanDataOptionButtonText}>
                Borrar todos los backups
              </Text>
            </Pressable>

            {expandedCleanOption === "backups" && (
              <View style={styles.cleanDataConfirmPanel}>
                <Text style={styles.expandedTitle}>Confirmar Borrado</Text>
                <Text style={styles.expandedMessage}>
                  Vas a eliminar TODOS los backups. El inventario actual se mantendrá. ¿Continuar?
                </Text>
                <View style={styles.expandedActions}>
                  <Pressable
                    style={styles.expandedButtonCancel}
                    onPress={() => setExpandedCleanOption(null)}
                    disabled={loading}
                  >
                    <Text style={styles.expandedButtonText}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    style={styles.expandedButtonConfirm}
                    onPress={handleConfirmDeleteAllBackups}
                    disabled={loading}
                  >
                    <Text style={styles.expandedButtonText}>
                      {loading ? "Borrando..." : "Borrar"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Option 2: Delete all backups and inventory */}
          <View style={styles.cleanDataOptionContainer}>
            <Pressable
              style={styles.cleanDataOptionButton}
              onPress={() => handleToggleCleanOption("all")}
              disabled={loading}
            >
              <Text style={styles.cleanDataOptionButtonText}>
                Borrar todos los backups y el inventario
              </Text>
            </Pressable>

            {expandedCleanOption === "all" && (
              <View style={[styles.cleanDataConfirmPanel, styles.cleanDataConfirmPanelWarning]}>
                <Text style={styles.expandedTitle}>⚠️ ELIMINAR TODO</Text>
                <Text style={styles.expandedMessage}>
                  Vas a eliminar TODOS los backups Y el inventario actual. Esta acción no se puede deshacer. ¿Estás completamente seguro?
                </Text>
                <View style={styles.expandedActions}>
                  <Pressable
                    style={styles.expandedButtonCancel}
                    onPress={() => setExpandedCleanOption(null)}
                    disabled={loading}
                  >
                    <Text style={styles.expandedButtonText}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.expandedButtonConfirm, styles.expandedButtonConfirmWarning]}
                    onPress={handleConfirmDeleteAllBackupsAndInventory}
                    disabled={loading}
                  >
                    <Text style={styles.expandedButtonText}>
                      {loading ? "Borrando..." : "Borrar Todo"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Option 3: Delete all lists */}
          <View style={styles.cleanDataOptionContainer}>
            <Pressable
              style={styles.cleanDataOptionButton}
              onPress={() => handleToggleCleanOption("lists")}
              disabled={loading}
            >
              <Text style={styles.cleanDataOptionButtonText}>
                Borrar todas las listas guardadas
              </Text>
            </Pressable>

            {expandedCleanOption === "lists" && (
              <View style={styles.cleanDataConfirmPanel}>
                <Text style={styles.expandedTitle}>Confirmar Borrado</Text>
                <Text style={styles.expandedMessage}>
                  Vas a eliminar TODAS las listas personalizadas guardadas. ¿Continuar?
                </Text>
                <View style={styles.expandedActions}>
                  <Pressable
                    style={styles.expandedButtonCancel}
                    onPress={() => setExpandedCleanOption(null)}
                    disabled={loading}
                  >
                    <Text style={styles.expandedButtonText}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    style={styles.expandedButtonConfirm}
                    onPress={handleConfirmDeleteAllLists}
                    disabled={loading}
                  >
                    <Text style={styles.expandedButtonText}>
                      {loading ? "Borrando..." : "Borrar"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </Card>
      </View>

      {/* Statistics Section */}
      <View style={styles.cardContainer}>
        <Card>
          <Text style={styles.cardTitle}>📊 Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Backups:</Text>
              <Text style={styles.statValue}>{backupStats.totalBackups}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Today's Backups:</Text>
              <Text style={styles.statValue}>{backupStats.todayBackups}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Max Per Day:</Text>
              <Text style={styles.statValue}>{maxBackups}</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Export Section */}
      <View style={styles.cardContainer}>
        <Card>
          <Text style={styles.cardTitle}>📤 Export</Text>
          <View style={styles.section}>
            <Text style={styles.description}>
              Export current inventory and backup file list for archival or
              migration.
            </Text>
            <Button
              title="Export Backup List"
              onPress={handleExportBackups}
              disabled={loading}
            />
          </View>
        </Card>
      </View>

      {/* Backups List Section */}
      <View style={styles.cardContainer}>
        <Card>
          <Text style={styles.cardTitle}>📋 Available Backups</Text>
          {backupFiles.length === 0 ? (
            <Text style={styles.emptyText}>No backups available</Text>
          ) : (
            <ScrollView style={styles.backupsList}>
              {backupFiles.map((filename) => {
                const isInventoryJson = filename === "inventory.json";
                const isLastBackup = !isInventoryJson && backupFiles.length > 1 && backupFiles[1] === filename;
                const backupDate = isInventoryJson ? "En uso actualmente" : parseBackupDate(filename);
                const isExpanded = expandedBackup === filename;

                return (
                  <View key={filename}>
                    <View style={[styles.backupItem, isInventoryJson && styles.backupItemActive]}>
                      <View style={styles.backupInfo}>
                        <Text style={[styles.backupName, isInventoryJson && styles.backupNameActive]} numberOfLines={1}>
                          {isInventoryJson ? "✓ inventory.json (EN USO)" : filename.replace("inventory_backup_", "").replace(".json", "")}
                        </Text>
                        <Text style={styles.backupSize}>
                          {backupDate}
                        </Text>
                      </View>
                      <View style={styles.backupActions}>
                        <Pressable
                          style={styles.actionButton}
                          onPress={() => handleDownloadBackup(filename)}
                          disabled={loading}
                        >
                          <Text style={styles.actionButtonText}>⬇️</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.actionButton, isExpanded ? styles.deleteButtonActive : styles.deleteButton]}
                          onPress={() => handleToggleBackupExpand(filename)}
                          disabled={loading}
                        >
                          <Text style={styles.actionButtonText}>🗑️</Text>
                        </Pressable>
                      </View>
                    </View>

                    {/* Expanded Delete Confirmation */}
                    {isExpanded && (
                      <View style={[styles.expandedPanel, (isLastBackup || isInventoryJson) && styles.expandedPanelWarning]}>
                        <Text style={styles.expandedTitle}>
                          {isInventoryJson
                            ? "⚠️ ELIMINAR ARCHIVO EN USO"
                            : isLastBackup
                            ? "⚠️ ÚLTIMO BACKUP"
                            : "Confirmar Borrado"}
                        </Text>
                        <Text style={styles.expandedMessage}>
                          {isInventoryJson
                            ? `Vas a eliminar el inventory.json que está en uso. Se promoverá el backup más reciente. ¿Continuar?`
                            : isLastBackup
                            ? `Vas a borrar el ÚLTIMO backup creado del día ${backupDate}. ¿Estás completamente seguro?`
                            : `Vas a borrar el backup del día ${backupDate}. ¿Continuar?`}
                        </Text>
                        <View style={styles.expandedActions}>
                          <Pressable
                            style={styles.expandedButtonCancel}
                            onPress={() => setExpandedBackup(null)}
                            disabled={loading}
                          >
                            <Text style={styles.expandedButtonText}>Cancelar</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.expandedButtonConfirm, (isLastBackup || isInventoryJson) && styles.expandedButtonConfirmWarning]}
                            onPress={() => handleConfirmDeleteBackup(filename)}
                            disabled={loading}
                          >
                            <Text style={styles.expandedButtonText}>
                              {loading ? "Borrando..." : "Borrar"}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  cardContainer: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  statsContainer: {
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2196F3",
  },
  description: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    lineHeight: 18,
  },
  backupsList: {
    maxHeight: 300,
    marginBottom: 12,
  },
  backupItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backupItemActive: {
    backgroundColor: "#f0f8ff",
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  backupInfo: {
    flex: 1,
  },
  backupName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  backupNameActive: {
    fontWeight: "bold",
    color: "#2196F3",
  },
  backupSize: {
    fontSize: 11,
    color: "#999",
  },
  backupActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: "#fee",
  },
  deleteButtonActive: {
    backgroundColor: "#f8d7da",
  },
  actionButtonText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 16,
  },
  expandedPanel: {
    backgroundColor: "#f9f9f9",
    borderLeftWidth: 4,
    borderLeftColor: "#FFA500",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 0,
    marginVertical: 4,
  },
  expandedPanelWarning: {
    backgroundColor: "#fff5f5",
    borderLeftColor: "#ff4444",
  },
  expandedTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  expandedMessage: {
    fontSize: 13,
    color: "#555",
    marginBottom: 12,
    lineHeight: 18,
  },
  expandedActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  expandedButtonCancel: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#ddd",
    borderRadius: 4,
  },
  expandedButtonConfirm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#FFA500",
    borderRadius: 4,
  },
  expandedButtonConfirmWarning: {
    backgroundColor: "#ff4444",
  },
  expandedButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  cleanDataOptionContainer: {
    marginBottom: 12,
  },
  cleanDataOptionButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cleanDataOptionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  cleanDataConfirmPanel: {
    backgroundColor: "#f9f9f9",
    borderLeftWidth: 4,
    borderLeftColor: "#FFA500",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 4,
  },
  cleanDataConfirmPanelWarning: {
    backgroundColor: "#fff5f5",
    borderLeftColor: "#ff4444",
  },
});

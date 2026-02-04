/**
 * Left column per specs.md §7: Inventory view + search.
 */

import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SearchBar } from "../../components/SearchBar";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { FileImportButton } from "../../components/FileImportButton";
import { formatItem } from "../../utils/itemFormat";
import type { Inventory } from "../../models/Inventory";

export interface InventoryViewProps {
  inventory: Inventory;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onImportFile: (fileContent: string) => void;
  onExportInventory: () => void;
  showExportDialog: boolean;
  onExportJSON: () => void;
  onExportTXT: () => void;
  onCancelExport: () => void;
}

function filterInventory(inventory: Inventory, query: string): Inventory {
  const q = query.trim();
  if (!q) return inventory;

  // If query starts with #, search only by tag
  if (q.startsWith("#")) {
    const tagSearch = q.substring(1).toLowerCase();
    return inventory.filter((item) =>
      (item.tag ?? "").toLowerCase().includes(tagSearch)
    );
  }

  // Otherwise, search by name or tag
  const qLower = q.toLowerCase();
  return inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(qLower) ||
      (item.tag ?? "").toLowerCase().includes(qLower)
  );
}

export function InventoryView({
  inventory,
  searchQuery,
  onSearchChange,
  onImportFile,
  onExportInventory,
  showExportDialog,
  onExportJSON,
  onExportTXT,
  onCancelExport,
}: InventoryViewProps): React.JSX.Element {
  const filtered = filterInventory(inventory, searchQuery);

  return (
    <View style={styles.column}>
      <FileImportButton
        title="Cargar inventario desde dispositivo"
        onFileRead={onImportFile}
      />
      <View style={styles.buttonSpacing}>
        <Button
          title="Descargar inventory.json"
          onPress={onExportInventory}
        />
      </View>
      {showExportDialog && (
        <Card>
          <View style={styles.formatDialogPanel}>
            <Text style={styles.formatDialogTitle}>Formato de descarga</Text>
            <Text style={styles.formatDialogMessage}>
              Elige el formato para descargar el inventario
            </Text>
            <View style={styles.formatDialogActions}>
              <Pressable
                style={styles.formatDialogButton}
                onPress={onExportJSON}
              >
                <Text style={styles.formatDialogButtonText}>JSON</Text>
              </Pressable>
              <Pressable
                style={styles.formatDialogButton}
                onPress={onExportTXT}
              >
                <Text style={styles.formatDialogButtonText}>TXT</Text>
              </Pressable>
              <Pressable
                style={styles.formatDialogButtonCancel}
                onPress={onCancelExport}
              >
                <Text style={styles.formatDialogButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </Card>
      )}
      <View style={styles.searchSpacing}>
        <SearchBar
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search"
        />
      </View>
      <ScrollView style={styles.scroll}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No items</Text>
        ) : (
          filtered.map((item, i) => (
            <Card key={`${item.name}-${item.tag ?? ""}-${i}`}>
              <Text>{formatItem(item)}</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, padding: 8 },
  scroll: { flex: 1 },
  empty: { color: "#666", padding: 8 },
  buttonSpacing: { marginTop: 5 },
  searchSpacing: { marginTop: 5 },
  formatDialogPanel: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    marginBottom: 8,
  },
  formatDialogTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 8,
    color: "#333",
  },
  formatDialogMessage: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },
  formatDialogActions: {
    flexDirection: "row",
    gap: 8,
  },
  formatDialogButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: "#2196f3",
    alignItems: "center",
  },
  formatDialogButtonCancel: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  formatDialogButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
});

/**
 * List cards panel per specs.md §8.
 * Left column: clickable cards showing all saved lists with name and "In use" checkbox.
 */

import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, useWindowDimensions } from "react-native";
import type { CustomList } from "../../models/CustomList";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { MultiFileImportButton } from "../../components/MultiFileImportButton";

export interface ListCardsProps {
  lists: CustomList[];
  selectedListName: string | null;
  onSelectList: (listName: string) => void;
  onToggleInUse: (listName: string, inUse: boolean) => void;
  onDeleteList: (listName: string) => void;
  expandedDeleteListName: string | null;
  onConfirmDeleteList: (listName: string) => void;
  loading: boolean;
  onDownloadAllLists: () => void;
  showDownloadDialog: boolean;
  onDownloadJSON: () => void;
  onDownloadTXT: () => void;
  onCancelDownload: () => void;
  onImportLists: (files: Array<{ name: string; content: string }>) => void;
  importMessage: string | null;
}

export function ListCards({
  lists,
  selectedListName,
  onSelectList,
  onToggleInUse,
  onDeleteList,
  expandedDeleteListName,
  onConfirmDeleteList,
  loading,
  onDownloadAllLists,
  showDownloadDialog,
  onDownloadJSON,
  onDownloadTXT,
  onCancelDownload,
  onImportLists,
  importMessage,
}: ListCardsProps): React.JSX.Element {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const getTotalQuantity = (list: CustomList): number => {
    return list.decklist.reduce((sum, item) => sum + item.quantity, 0);
  };

  const inUseCount = lists.filter(l => l.inUse).length;
  const notInUseCount = lists.filter(l => !l.inUse).length;

  return (
    <View style={styles.column}>
      <Text style={styles.title}>Lists ({inUseCount} en uso, {notInUseCount} no en uso)</Text>
      <ScrollView style={styles.scroll} scrollEnabled={true}>
        {lists.length === 0 ? (
          <Text style={styles.empty}>No lists</Text>
        ) : (
          <View style={styles.grid}>
            {lists.map((list) => (
              <View key={list.name} style={styles.gridItem}>
                <Pressable
                  style={[
                    styles.card,
                    isMobile && styles.cardMobile,
                    selectedListName === list.name && styles.cardSelected,
                  ]}
                  onPress={() => onSelectList(list.name)}
                >
                  <View style={styles.cardContent}>
                    <Text style={styles.listName} numberOfLines={3}>
                      {list.name}
                    </Text>
                    {isMobile ? (
                      <Text style={styles.itemCountMobile}>
                        [{getTotalQuantity(list)} items]
                      </Text>
                    ) : (
                      <Text style={styles.itemCount}>
                        [{getTotalQuantity(list)} items]
                      </Text>
                    )}
                  </View>

                  <View style={[styles.actions, isMobile && styles.actionsMobile]}>
                    <Pressable
                      style={styles.checkbox}
                      onPress={() => onToggleInUse(list.name, !list.inUse)}
                    >
                      <View
                        style={[
                          styles.checkboxLabel,
                          list.inUse && styles.checkboxLabelChecked,
                        ]}
                      >
                        <Text style={styles.checkboxLabelText}>
                          {list.inUse ? "✓" : ""}
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => onDeleteList(list.name)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </Pressable>
                  </View>
                </Pressable>

                {expandedDeleteListName === list.name && (
                  <Card>
                    <View style={styles.deleteConfirmPanel}>
                      <Text style={styles.deleteConfirmTitle}>Confirmar Borrado</Text>
                      <Text style={styles.deleteConfirmMessage}>
                        ¿Estás seguro de que deseas eliminar "{list.name}"?
                      </Text>
                      <View style={styles.deleteConfirmActions}>
                        <Pressable
                          style={styles.deleteConfirmButtonCancel}
                          onPress={() => onDeleteList(list.name)}
                          disabled={loading}
                        >
                          <Text style={styles.deleteConfirmButtonText}>Cancelar</Text>
                        </Pressable>
                        <Pressable
                          style={styles.deleteConfirmButtonConfirm}
                          onPress={() => onConfirmDeleteList(list.name)}
                          disabled={loading}
                        >
                          <Text style={styles.deleteConfirmButtonText}>
                            {loading ? "Borrando..." : "Borrar"}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </Card>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={[styles.buttonsRow, isMobile && styles.buttonsRowMobile]}>
        <View style={[styles.importButtonContainer, isMobile && styles.buttonMobile]}>
          <MultiFileImportButton
            title="Importar listas"
            onFilesRead={onImportLists}
            accept=".json,.txt"
          />
        </View>
        <View style={[styles.downloadButtonContainer, isMobile && styles.buttonMobile]}>
          <Button title="Descargar todas" onPress={onDownloadAllLists} />
        </View>
      </View>
      {importMessage && (
        <Text style={styles.importMessage}>{importMessage}</Text>
      )}
      {showDownloadDialog && (
        <Card>
          <View style={styles.formatDialogPanel}>
            <Text style={styles.formatDialogTitle}>Formato de descarga</Text>
            <Text style={styles.formatDialogMessage}>
              Elige el formato para descargar las listas
            </Text>
            <View style={styles.formatDialogActions}>
              <Pressable
                style={styles.formatDialogButton}
                onPress={onDownloadJSON}
              >
                <Text style={styles.formatDialogButtonText}>JSON</Text>
              </Pressable>
              <Pressable
                style={styles.formatDialogButton}
                onPress={onDownloadTXT}
              >
                <Text style={styles.formatDialogButtonText}>TXT</Text>
              </Pressable>
              <Pressable
                style={styles.formatDialogButtonCancel}
                onPress={onCancelDownload}
              >
                <Text style={styles.formatDialogButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, padding: 8 },
  title: { fontWeight: "bold", marginBottom: 8 },
  scroll: { flex: 1 },
  empty: { color: "#666", padding: 8 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 8,
  },
  gridItem: {
    width: "31%",
    marginBottom: 4,
  },
  listItemContainer: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    minHeight: 50,
  },
  cardMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  cardSelected: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
    borderWidth: 2,
  },
  cardContent: { marginBottom: 4 },
  listName: { fontWeight: "bold", fontSize: 13, marginBottom: 0 },
  itemCount: { color: "#888", fontSize: 9 },
  itemCountMobile: { color: "#888", fontSize: 10, marginTop: 2 },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 0,
  },
  checkboxLabel: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxLabelChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkboxLabelText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 10,
  },
  checkboxText: { fontSize: 10, color: "#666", marginLeft: 4, display: "none" },
  actions: {
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    justifyContent: "flex-start",
    marginRight: 4,
  },
  actionsMobile: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 6,
    marginRight: 0,
    gap: 10,
  },
  deleteButton: {
    padding: 0,
    marginLeft: 0,
  },
  deleteButtonText: {
    fontSize: 12,
  },
  deleteConfirmPanel: {
    padding: 12,
    backgroundColor: "#fff5f5",
    borderRadius: 4,
    marginTop: 4,
  },
  deleteConfirmTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 8,
    color: "#d32f2f",
  },
  deleteConfirmMessage: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    lineHeight: 18,
  },
  deleteConfirmActions: {
    flexDirection: "row",
    gap: 8,
  },
  deleteConfirmButtonCancel: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  deleteConfirmButtonConfirm: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: "#d32f2f",
    alignItems: "center",
  },
  deleteConfirmButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  downloadButtonContainer: {
    paddingTop: 8,
    alignItems: "center",
  },
  importButtonContainer: {
    paddingTop: 8,
    alignItems: "center",
  },
  buttonsRow: {
    flexDirection: "column",
  },
  buttonsRowMobile: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 8,
  },
  buttonMobile: {
    flex: 1,
    paddingTop: 8,
  },
  importMessage: {
    marginTop: 8,
    marginHorizontal: 8,
    padding: 8,
    fontSize: 13,
    color: "#333",
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    textAlign: "left",
  },
  formatDialogPanel: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    marginTop: 8,
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

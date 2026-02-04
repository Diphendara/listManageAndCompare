/**
 * Custom Lists section per specs.md §8: three vertical columns.
 * Left: List cards (clickable) | Center: List preview | Right: List editor.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, Alert, TextInput, Pressable, Text, useWindowDimensions, ScrollView } from "react-native";
import type { CustomList, ListItem } from "../../models/CustomList";
import type { CustomListsService } from "../../services/customListsService";
import { parseListText } from "../../parsers/listItemParser";
import { ListCards } from "./ListCards";
import { ListPreview } from "./ListPreview";
import { ListEditor } from "./ListEditor";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

export interface CustomListsScreenProps {
  customListsService: CustomListsService;
  refreshTrigger?: number;
  onListsCountChange?: (count: number) => void;
}

export function CustomListsScreen({
  customListsService,
  refreshTrigger,
  onListsCountChange,
}: CustomListsScreenProps): React.JSX.Element {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  const [lists, setLists] = useState<CustomList[]>([]);
  const [selectedListName, setSelectedListName] = useState<string | null>(null);
  const [selectedListEditName, setSelectedListEditName] = useState<string>("");
  const [editorText, setEditorText] = useState("");
  const [loading, setLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [expandedDeleteListName, setExpandedDeleteListName] = useState<string | null>(null);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [createName, setCreateName] = useState("");
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const createNameInputRef = useRef<TextInput | null>(null);

  // Load lists on mount and when refreshTrigger changes
  useEffect(() => {
    async function loadLists() {
      try {
        setLoading(true);
        const loadedLists = await customListsService.getAllLists();
        setLists(loadedLists);
      } catch (err) {
        console.error("Failed to load lists:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLists();
  }, [customListsService, refreshTrigger]);

  useEffect(() => {
    if (onListsCountChange) {
      onListsCountChange(lists.length);
    }
  }, [lists.length, onListsCountChange]);

  useEffect(() => {
    if (showCreateInput) {
      const id = setTimeout(() => {
        createNameInputRef.current?.focus();
      }, 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [showCreateInput]);

  const selectedList = lists.find((l) => l.name === selectedListName) || null;

  const handleSelectList = useCallback((listName: string) => {
    setSelectedListName(listName);
    setSelectedListEditName(listName);
    setUpdateMessage(null);
    const list = lists.find((l) => l.name === listName);
    if (list) {
      // Format decklist back to text
      const text = list.decklist.map((item) => `${item.quantity}x ${item.name}`).join("\n");
      setEditorText(text);
    }
  }, [lists]);

  const handleCreateList = useCallback(async () => {
    // Open inline input for list name
    setCreateName("");
    setShowCreateInput(true);
    setUpdateMessage(null);
  }, [lists, editorText, customListsService]);

  const handleConfirmCreate = useCallback(async () => {
    const listName = createName?.trim();
    if (!listName) return;

    // Check if list already exists
    const exists = lists.some((l) => l.name === listName);
    if (exists) {
      Alert.alert("Error", "A list with that name already exists");
      return;
    }

    // Parse the editor text
    const result = parseListText(editorText);
    if (!result.ok) {
      Alert.alert("Parse Error", result.error);
      return;
    }

    // Create new list
    const newList: CustomList = {
      name: listName,
      inUse: true,
      decklist: result.items,
    };

    try {
      setLoading(true);
      await customListsService.saveList(newList);
      setLists([...lists, newList]);
      setEditorText("");
      setShowCreateInput(false);
      Alert.alert("Success", `List "${newList.name}" created`);
    } catch (err) {
      Alert.alert(
        "Save Error",
        err instanceof Error ? err.message : "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  }, [createName, lists, editorText, customListsService]);

  const handleCancelCreate = useCallback(() => {
    setShowCreateInput(false);
    setCreateName("");
  }, []);

  const handleUpdateList = useCallback(async () => {
    if (!selectedListName) {
      Alert.alert("Error", "No list selected");
      return;
    }

    // Parse the editor text
    const result = parseListText(editorText);
    if (!result.ok) {
      Alert.alert("Parse Error", result.error);
      return;
    }

    // Get the current list from the lists array
    const currentList = lists.find((l) => l.name === selectedListName);
    if (!currentList) {
      Alert.alert("Error", "List not found");
      return;
    }

    const newName = selectedListEditName?.trim() || selectedListName;

    // Prevent rename conflict
    if (newName !== selectedListName && lists.some((l) => l.name === newName)) {
      Alert.alert("Error", "Ya existe una lista con ese nombre");
      return;
    }

    const updatedList: CustomList = {
      ...currentList,
      name: newName,
      decklist: result.items,
    };

    try {
      setLoading(true);
      // Save under new name (or same name)
      await customListsService.saveList(updatedList);

      // If renamed, delete old file and update listasEnUso.json by replacing the name
      if (newName !== selectedListName) {
        await customListsService.deleteList(selectedListName, newName);
      }

      // Update local lists in place
      const newLists = lists.map((l) => (l.name === selectedListName ? updatedList : l));
      setLists(newLists);
      setSelectedListName(null);
      setSelectedListEditName("");
      setEditorText("");
      setUpdateMessage(`Lista "${updatedList.name}" actualizada`);
    } catch (err) {
      Alert.alert(
        "❌ Error",
        err instanceof Error ? err.message : "No se pudo actualizar la lista"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedListName, lists, editorText, customListsService, selectedListEditName]);

  const handleToggleInUse = useCallback(
    async (listName: string, inUse: boolean) => {
      try {
        await customListsService.updateListInUseStatus(listName, inUse);
        setLists(
          lists.map((l) => (l.name === listName ? { ...l, inUse } : l))
        );
      } catch (err) {
        Alert.alert(
          "Error",
          err instanceof Error ? err.message : "Unknown error"
        );
      }
    },
    [lists, customListsService]
  );

  const handleDeleteList = useCallback(
    (listName: string) => {
      setExpandedDeleteListName(
        expandedDeleteListName === listName ? null : listName
      );
    },
    [expandedDeleteListName]
  );

  const handleConfirmDeleteList = useCallback(
    async (listName: string) => {
      try {
        setLoading(true);
        await customListsService.deleteList(listName);
        setLists(lists.filter((l) => l.name !== listName));
        if (selectedListName === listName) {
          setSelectedListName(null);
          setSelectedListEditName("");
          setEditorText("");
        }
        setExpandedDeleteListName(null);
        Alert.alert("✓ Éxito", `Lista "${listName}" eliminada`);
      } catch (err) {
        Alert.alert(
          "❌ Error",
          err instanceof Error ? err.message : "No se pudo eliminar la lista"
        );
      } finally {
        setLoading(false);
      }
    },
    [lists, selectedListName, customListsService]
  );

  const handleDownloadAllLists = useCallback(() => {
    if (lists.length === 0) {
      Alert.alert("Info", "No hay listas para descargar");
      return;
    }
    setShowDownloadDialog(true);
  }, [lists]);

  const handleDownloadJSON = useCallback(async () => {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      lists.forEach((list) => {
        const jsonString = JSON.stringify(list, null, 2);
        zip.file(`${list.name}.json`, jsonString);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "all_lists.zip";
      link.click();
      URL.revokeObjectURL(url);
      setShowDownloadDialog(false);
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "No se pudo crear el archivo zip"
      );
    }
  }, [lists]);

  const handleDownloadTXT = useCallback(async () => {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      lists.forEach((list) => {
        const textLines = list.decklist.map(
          (item) => `${item.quantity}x ${item.name}`
        );
        const text = textLines.join("\n");
        zip.file(`${list.name}.txt`, text);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "all_lists.zip";
      link.click();
      URL.revokeObjectURL(url);
      setShowDownloadDialog(false);
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "No se pudo crear el archivo zip"
      );
    }
  }, [lists]);

  const handleImportLists = useCallback(
    async (files: Array<{ name: string; content: string }>) => {
      // Clear previous message
      setImportMessage(null);
      
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      const importedNames = new Set<string>(); // Track names imported in this batch

      for (const file of files) {
        try {
          const fileName = file.name;
          const extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
          let listNameFromFile = fileName.substring(0, fileName.lastIndexOf("."));

          let customList: CustomList;

          if (extension === ".json") {
            // Parse JSON first to get the real name
            const parsed = JSON.parse(file.content);
            customList = parsed as CustomList;
            
            // Use the name from JSON content, not filename
            if (!customList.name) {
              errors.push(`"${fileName}": JSON sin campo "name"`);
              errorCount++;
              continue;
            }
          } else if (extension === ".txt") {
            // Parse TXT format (quantity x name)
            const result = parseListText(file.content);
            if (!result.ok) {
              errors.push(`"${fileName}": ${result.error}`);
              errorCount++;
              continue;
            }
            customList = {
              name: listNameFromFile,
              decklist: result.items,
              inUse: false,
            };
          } else {
            errors.push(`"${fileName}": formato no soportado`);
            errorCount++;
            continue;
          }

          // Check if list already exists in current lists
          if (lists.some((l) => l.name === customList.name)) {
            errors.push(`"${customList.name}" ya existe (archivo: ${fileName})`);
            errorCount++;
            continue;
          }

          // Check if already imported in this batch
          if (importedNames.has(customList.name)) {
            errors.push(`"${customList.name}" duplicado en archivos importados (archivo: ${fileName})`);
            errorCount++;
            continue;
          }

          // Save the list
          await customListsService.saveList(customList);
          importedNames.add(customList.name);
          successCount++;
        } catch (err) {
          errors.push(`"${file.name}": ${err instanceof Error ? err.message : "error desconocido"}`);
          errorCount++;
        }
      }

      // Reload lists
      const loadedLists = await customListsService.getAllLists();
      setLists(loadedLists);

      // Show result
      const message = [
        successCount > 0 ? `✓ ${successCount} lista(s) importada(s)` : "",
        errorCount > 0 ? `✖ ${errorCount} error(es)` : "",
        errors.length > 0 ? `\n${errors.join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      setImportMessage(message);
    },
    [lists, customListsService]
  );

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <View style={[styles.column, isMobile && styles.columnMobileTop]}>
        <ListCards
          lists={lists}
          selectedListName={selectedListName}
          onSelectList={handleSelectList}
          onToggleInUse={handleToggleInUse}
          onDeleteList={handleDeleteList}
          expandedDeleteListName={expandedDeleteListName}
          onConfirmDeleteList={handleConfirmDeleteList}
          loading={loading}
          onDownloadAllLists={handleDownloadAllLists}
          showDownloadDialog={showDownloadDialog}
          onDownloadJSON={handleDownloadJSON}
          onDownloadTXT={handleDownloadTXT}
          onCancelDownload={() => setShowDownloadDialog(false)}
          onImportLists={handleImportLists}
          importMessage={importMessage}
        />
      </View>
      {!isMobile && (
        <View style={styles.column}>
          <ListPreview selectedList={selectedList} />
        </View>
      )}
      {isMobile ? (
        <ScrollView style={[styles.column, styles.columnMobileBottom]}>
          {showCreateInput && (
            <Card>
              <Text style={styles.cardTitle}>Crear nueva lista</Text>
              <TextInput
                ref={createNameInputRef}
                style={styles.createInput}
                placeholder="Nombre de la lista"
                value={createName}
                onChangeText={setCreateName}
                editable={!loading}
              />
              <View style={styles.createActions}>
                <Pressable style={styles.createCancel} onPress={handleCancelCreate} disabled={loading}>
                  <Text style={styles.createActionText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.createConfirm} onPress={handleConfirmCreate} disabled={loading}>
                  <Text style={styles.createActionText}>{loading ? "Creando..." : "Crear"}</Text>
                </Pressable>
              </View>
            </Card>
          )}

          <ListEditor
            editorText={editorText}
            onEditorTextChange={setEditorText}
            onCreateList={handleCreateList}
            onUpdateList={handleUpdateList}
            hasSelectedList={selectedList !== null}
            listName={selectedListEditName}
            onListNameChange={setSelectedListEditName}
            onListNameSubmit={handleUpdateList}
            updateMessage={updateMessage}
          />
        </ScrollView>
      ) : (
        <View style={styles.column}>
          {showCreateInput && (
            <Card>
              <Text style={styles.cardTitle}>Crear nueva lista</Text>
              <TextInput
                ref={createNameInputRef}
                style={styles.createInput}
                placeholder="Nombre de la lista"
                value={createName}
                onChangeText={setCreateName}
                editable={!loading}
              />
              <View style={styles.createActions}>
                <Pressable style={styles.createCancel} onPress={handleCancelCreate} disabled={loading}>
                  <Text style={styles.createActionText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.createConfirm} onPress={handleConfirmCreate} disabled={loading}>
                  <Text style={styles.createActionText}>{loading ? "Creando..." : "Crear"}</Text>
                </Pressable>
              </View>
            </Card>
          )}

          <ListEditor
            editorText={editorText}
            onEditorTextChange={setEditorText}
            onCreateList={handleCreateList}
            onUpdateList={handleUpdateList}
            hasSelectedList={selectedList !== null}
            listName={selectedListEditName}
            onListNameChange={setSelectedListEditName}
            onListNameSubmit={handleUpdateList}
            updateMessage={updateMessage}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  containerMobile: {
    flexDirection: "column",
  },
  column: {
    flex: 1,
  },
  columnMobileTop: {
    flex: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  columnMobileBottom: {
    flex: 0.5,
  },
  cardTitle: { fontWeight: "bold", marginBottom: 8 },
  createInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 8,
  },
  createActions: { flexDirection: "row", justifyContent: "space-between" },
  createCancel: {
    flex: 1,
    marginRight: 8,
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 4,
    alignItems: "center",
  },
  createConfirm: {
    flex: 1,
    padding: 10,
    backgroundColor: "#2196f3",
    borderRadius: 4,
    alignItems: "center",
  },
  createActionText: { color: "#fff", fontWeight: "600" },
});

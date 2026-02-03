/**
 * Comparisons section (stub for future development).
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import type { InventoryService } from "../../services/inventoryService";
import type { CustomListsService } from "../../services/customListsService";
import { SearchBar } from "../../components/SearchBar";
import type { Inventory } from "../../models/Inventory";
import type { CustomList } from "../../models/CustomList";

export interface ComparisonsScreenProps {
  inventoryService?: InventoryService;
  customListsService?: CustomListsService;
  refreshTrigger?: number;
}

/**
 * Comparisons section: four vertical columns.
 * We'll implement the left-most column "Inventario en uso" first.
 */
export function ComparisonsScreen({
  inventoryService,
  customListsService,
  refreshTrigger,
}: ComparisonsScreenProps): React.JSX.Element {
  const [inventory, setInventory] = useState<Inventory>([]);
  const [lists, setLists] = useState<CustomList[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadInventory = useCallback(async () => {
    if (!inventoryService) return;
    const data = await inventoryService.loadInventory();
    setInventory(data);
  }, [inventoryService]);

  const loadLists = useCallback(async () => {
    if (!customListsService) return;
    const data = await customListsService.getAllLists();
    setLists(data);
  }, [customListsService]);

  useEffect(() => {
    void loadInventory();
    void loadLists();
  }, [loadInventory, loadLists, refreshTrigger]);

  // Group inventory items by name only (ignore tag differences) and sum quantities
  const groupedInventory = React.useMemo(() => {
    const map = new Map<string, { name: string; quantity: number }>();
    for (const it of inventory) {
      const key = it.name.trim().toLowerCase();
      const prev = map.get(key);
      if (prev) prev.quantity += it.quantity;
      else map.set(key, { name: it.name, quantity: it.quantity });
    }
    return Array.from(map.values());
  }, [inventory]);

  // Search by name only (ignore tags and any # prefix behavior)
  const filteredInventory = groupedInventory.filter((it) =>
    it.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleToggleInUse = async (listName: string, inUse: boolean) => {
    if (!customListsService) return;
    // Optimistically update local state to preserve displayed order
    let previous: CustomList[] = [];
    setLists((prev) => {
      previous = prev;
      return prev.map((l) => (l.name === listName ? { ...l, inUse } : l));
    });

    try {
      await customListsService.updateListInUseStatus(listName, inUse);
    } catch (err) {
      // Revert on error
      setLists(previous);
      Alert.alert("Error", "No se pudo actualizar el estado de la lista");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <Text style={styles.columnTitle}>Inventario en uso</Text>

        <View style={styles.listsGridWrapper}>
          <Text style={styles.listsTitle}>Listas cargadas</Text>
          {lists.length === 0 ? (
            <Text style={styles.empty}>No hay listas</Text>
          ) : (
            <View style={styles.grid}>
              {lists.map((l) => (
                <Pressable
                  key={l.name}
                  style={styles.gridItem}
                  onPress={() => handleToggleInUse(l.name, !l.inUse)}
                >
                  <Text style={styles.gridItemName} numberOfLines={2}>
                    {l.name}
                  </Text>
                  <View
                    style={[
                      styles.checkboxLabel,
                      l.inUse && styles.checkboxLabelChecked,
                    ]}
                  >
                    <Text style={styles.checkboxLabelText}>{l.inUse ? "✓" : ""}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por nombre"
        />

        <ScrollView style={styles.scroll}>
          {filteredInventory.length === 0 ? (
            <Text style={styles.empty}>No hay items</Text>
          ) : (
            filteredInventory.map((it) => (
              <View key={it.name} style={styles.invRow}>
                <Text style={styles.invName}>{it.name}</Text>
                <Text style={styles.invQty}>{it.quantity}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.column}>
        <Text style={styles.columnTitle}>Cartas que tienes</Text>
      </View>
      <View style={styles.column}>
        <Text style={styles.columnTitle}>Cartas que faltan</Text>
      </View>
      <View style={styles.column}>
        <Text style={styles.columnTitle}>Lista deseada</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  column: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  columnTitle: { fontWeight: "bold", marginBottom: 8 },
  scroll: { flex: 1 },
  empty: { color: "#666", padding: 8 },
  invRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#fafafa",
  },
  invName: { fontSize: 13 },
  invQty: { fontSize: 13, color: "#333" },
  listsPanel: { marginTop: 12 },
  listsTitle: { fontWeight: "600", marginBottom: 6 },
  listsGridWrapper: { marginBottom: 8 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 8,
  },
  gridItem: {
    width: "24%",
    margin: 1,
    marginBottom: 2,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gridItemName: { fontSize: 12, textAlign: "left", flex: 1, marginRight: 8 },
  checkboxLabel: {
    width: 16,
    height: 16,
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
  checkboxLabelText: { color: "#fff", fontWeight: "bold", fontSize: 10 },
});

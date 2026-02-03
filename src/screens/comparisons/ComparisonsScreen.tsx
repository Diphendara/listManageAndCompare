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
import { TextArea } from "../../components/TextArea";
import { parseText } from "../../parsers/itemParser";
import type { Inventory } from "../../models/Inventory";
import type { CustomList } from "../../models/CustomList";
import type { Item } from "../../models/Item";

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
  const [desiredListText, setDesiredListText] = useState("");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

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

  // Sum quantities by name across ALL saved lists (regardless of inUse)
  const listTotalsByName = React.useMemo(() => {
    const totals = new Map<string, number>();
    for (const list of lists) {
      for (const item of list.decklist) {
        const key = item.name.trim().toLowerCase();
        totals.set(key, (totals.get(key) ?? 0) + item.quantity);
      }
    }
    return totals;
  }, [lists]);

  // Parse desired list and compute have/missing
  const { cardsYouHave, cardsMissing } = React.useMemo(() => {
    const result = parseText(desiredListText);
    const have: Array<Item & { inInventory: number }> = [];
    const missing: Array<Item & { inInventory: number }> = [];

    if (result.ok) {
      for (const item of result.items) {
        const key = item.name.trim().toLowerCase();
        const inInventory = groupedInventory.find(
          (it) => it.name.trim().toLowerCase() === key
        )?.quantity ?? 0;
        const listInUse = listTotalsByName.get(key) ?? 0;

        // Available cards = total inventory - cards in use
        const available = inInventory - listInUse;

        // If desired > available: missing
        if (item.quantity > available) {
          missing.push({ ...item, inInventory });
        }
        // If desired <= available: have
        else {
          have.push({ ...item, inInventory });
        }
      }
    }
    return { cardsYouHave: have, cardsMissing: missing };
  }, [desiredListText, groupedInventory, listTotalsByName]);

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
            filteredInventory.map((it) => {
              const listTotal = listTotalsByName.get(it.name.trim().toLowerCase()) ?? 0;
              const isMatch = listTotal === it.quantity;
              const key = it.name.trim().toLowerCase();
              const isExpanded = expandedItem === key;
              
              // Find lists that contain this item and are inUse
              const listsWithItem = lists.filter((list) => {
                return list.inUse && list.decklist.some(
                  (item) => item.name.trim().toLowerCase() === key
                );
              });
              
              return (
                <View key={it.name}>
                  <Pressable
                    style={styles.invRow}
                    onPress={() => setExpandedItem(isExpanded ? null : key)}
                  >
                    <Text style={[styles.invName, isMatch && styles.invMatch]}>{it.name}</Text>
                    <Text style={[styles.invQty, isMatch && styles.invMatch]}>
                      {listTotal}/{it.quantity}
                    </Text>
                  </Pressable>
                  {isExpanded && listsWithItem.length > 0 && (
                    <View style={styles.expandedSection}>
                      <Text style={styles.expandedTitle}>En uso en:</Text>
                      {listsWithItem.map((list) => (
                        <Text key={list.name} style={styles.expandedListName}>
                          • {list.name}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      <View style={styles.column}>
        <Text style={styles.columnTitle}>Cartas que tienes</Text>
        <ScrollView style={styles.scroll}>
          {cardsYouHave.length === 0 ? (
            <Text style={styles.empty}>No hay cartas</Text>
          ) : (
            cardsYouHave.map((item, i) => (
              <View key={`${item.name}-${item.tag ?? ""}-${i}`} style={styles.cardRow}>
                <Text style={styles.cardName}>
                  {item.quantity}x {item.name}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
      <View style={styles.column}>
        <Text style={styles.columnTitle}>Cartas que faltan</Text>
        <ScrollView style={styles.scroll}>
          {cardsMissing.length === 0 ? (
            <Text style={styles.empty}>No hay cartas</Text>
          ) : (
            cardsMissing.map((item, i) => (
              <View key={`${item.name}-${item.tag ?? ""}-${i}`} style={styles.cardRow}>
                <Text style={styles.cardName}>
                  {item.quantity}x {item.name}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
      <View style={styles.column}>
        <Text style={styles.columnTitle}>Lista deseada</Text>
        <TextArea
          value={desiredListText}
          onChangeText={setDesiredListText}
          placeholder="e.g. 3x Card A&#10;2x Card B"
        />
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
  invMatch: { color: "#d32f2f", fontWeight: "bold" },
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
  cardRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#fafafa",
  },
  cardName: { fontSize: 13, fontWeight: "500" },
  cardMissing: { fontSize: 12, color: "#d32f2f", marginTop: 2 },
  expandedSection: {
    paddingLeft: 16,
    paddingVertical: 6,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  expandedTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  expandedListName: {
    fontSize: 11,
    color: "#333",
    marginLeft: 8,
    marginVertical: 2,
  },
});

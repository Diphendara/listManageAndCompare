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
  useWindowDimensions,
} from "react-native";
import type { InventoryService } from "../../services/inventoryService";
import type { CustomListsService } from "../../services/customListsService";
import { SearchBar } from "../../components/SearchBar";
import { TextArea } from "../../components/TextArea";
import { Button } from "../../components/Button";
import { Toast } from "../../components/Toast";
import { parseText } from "../../parsers/itemParser";
import type { Inventory } from "../../models/Inventory";
import type { CustomList } from "../../models/CustomList";
import type { Item } from "../../models/Item";
import { toTitleCase } from "../../utils/textFormat";

export interface ComparisonsScreenProps {
  inventoryService?: InventoryService;
  customListsService?: CustomListsService;
  refreshTrigger?: number;
}

interface LeftColumnProps {
  isMobile: boolean;
  expandedListsSection: boolean;
  onToggleExpandedListsSection: () => void;
  lists: CustomList[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  filteredInventory: Array<{ name: string; quantity: number }>;
  listTotalsByName: Map<string, number>;
  expandedItem: string | null;
  onToggleExpandedItem: (key: string | null) => void;
  listsWithItemByName: Map<string, CustomList[]>;
  onToggleListInUse: (listName: string, inUse: boolean) => void;
}

const LeftColumn = React.memo(function LeftColumn({
  isMobile,
  expandedListsSection,
  onToggleExpandedListsSection,
  lists,
  searchQuery,
  onSearchQueryChange,
  filteredInventory,
  listTotalsByName,
  expandedItem,
  onToggleExpandedItem,
  listsWithItemByName,
  onToggleListInUse,
}: LeftColumnProps): React.JSX.Element {
  return (
    <View style={[styles.column, isMobile && styles.columnMobileTop]}>
      <Text style={styles.columnTitle}>Inventario en uso</Text>

      <View style={styles.listsGridWrapper}>
        <Pressable
          style={styles.listsHeaderButton}
          onPress={onToggleExpandedListsSection}
        >
          <Text style={styles.listsTitle}>
            Listas cargadas {isMobile && (expandedListsSection ? "▼" : "▶")}
          </Text>
        </Pressable>
        {expandedListsSection && (
          <>
            {lists.length === 0 ? (
              <Text style={styles.empty}>No hay listas</Text>
            ) : (
              <View style={styles.grid}>
                {lists.map((l) => (
                  <Pressable
                    key={l.name}
                    style={styles.gridItem}
                    onPress={() => onToggleListInUse(l.name, !l.inUse)}
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
          </>
        )}
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        placeholder="Buscar por nombre"
      />

      <ScrollView style={[styles.scroll, isMobile && styles.scrollMobile]}>
        {filteredInventory.length === 0 ? (
          <Text style={styles.empty}>No hay items</Text>
        ) : (
          filteredInventory.map((it) => {
            const key = it.name.trim().toLowerCase();
            const listTotal = listTotalsByName.get(key) ?? 0;
            const isMatch = listTotal === it.quantity;
            const isExpanded = expandedItem === key;
            const listsWithItem = listsWithItemByName.get(key) ?? [];

            return (
              <View key={it.name}>
                <Pressable
                  style={styles.invRow}
                  onPress={() => onToggleExpandedItem(isExpanded ? null : key)}
                >
                  <Text style={[styles.invName, isMatch && styles.invMatch]}>
                    {toTitleCase(it.name)}
                  </Text>
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
  );
});

/**
 * Comparisons section: four vertical columns.
 * We'll implement the left-most column "Inventario en uso" first.
 */
export function ComparisonsScreen({
  inventoryService,
  customListsService,
  refreshTrigger,
}: ComparisonsScreenProps): React.JSX.Element {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  const [inventory, setInventory] = useState<Inventory>([]);
  const [lists, setLists] = useState<CustomList[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [desiredListText, setDesiredListText] = useState("");
  const [textAreaValue, setTextAreaValue] = useState("");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [expandedListsSection, setExpandedListsSection] = useState(!isMobile);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleExpandedListsSection = useCallback(() => {
    if (!isMobile) return;
    setExpandedListsSection((prev) => !prev);
  }, [isMobile]);

  const handleCheckDesiredList = useCallback(() => {
    setDesiredListText(textAreaValue);
    setShowResults(true);
  }, [textAreaValue]);

  const handleTextAreaKeyPress = useCallback(
    (event: { nativeEvent: { key: string } }) => {
      if (event.nativeEvent.key === "Enter") {
        handleCheckDesiredList();
      }
    },
    [handleCheckDesiredList]
  );

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
  const filteredInventory = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length === 0) return groupedInventory;
    return groupedInventory.filter((it) => it.name.toLowerCase().includes(query));
  }, [groupedInventory, searchQuery]);

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

  // Pre-compute which lists contain each item (for expanded view)
  const listsWithItemByName = React.useMemo(() => {
    const map = new Map<string, CustomList[]>();
    for (const list of lists) {
      if (!list.inUse) continue;
      for (const item of list.decklist) {
        const key = item.name.trim().toLowerCase();
        const existing = map.get(key) ?? [];
        if (!existing.includes(list)) {
          existing.push(list);
        }
        map.set(key, existing);
      }
    }
    return map;
  }, [lists]);

  // Parse desired list and compute have/missing
  const { cardsYouHave, cardsMissing } = React.useMemo(() => {
    // Only compute if showResults is true (both mobile and web)
    if (!showResults) {
      return { cardsYouHave: [], cardsMissing: [] };
    }
    
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
  }, [desiredListText, groupedInventory, listTotalsByName, isMobile, showResults]);

  const handleToggleInUse = useCallback(async (listName: string, inUse: boolean) => {
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
  }, [customListsService]);

  const handleCopyCardsYouHave = useCallback(() => {
    if (cardsYouHave.length === 0) {
      setToastMessage("No hay cartas disponibles");
      return;
    }
    const text = cardsYouHave
      .map((item) => `${item.quantity}x ${toTitleCase(item.name)}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setToastMessage("Cartas copiadas");
  }, [cardsYouHave]);

  const handleCopyCardsMissing = useCallback(() => {
    if (cardsMissing.length === 0) {
      setToastMessage("No hay cartas no disponibles");
      return;
    }
    const text = cardsMissing
      .map((item) => `${item.quantity}x ${toTitleCase(item.name)}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setToastMessage("Cartas copiadas");
  }, [cardsMissing]);

  const handleDownloadCardsYouHave = useCallback(() => {
    if (cardsYouHave.length === 0) {
      setToastMessage("No hay cartas disponibles");
      return;
    }
    const text = cardsYouHave
      .map((item) => `${item.quantity}x ${toTitleCase(item.name)}`)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cartas_disponibles.txt";
    link.click();
    URL.revokeObjectURL(url);
    setToastMessage("Descargado");
  }, [cardsYouHave]);

  const handleDownloadCardsMissing = useCallback(() => {
    if (cardsMissing.length === 0) {
      setToastMessage("No hay cartas no disponibles");
      return;
    }
    const text = cardsMissing
      .map((item) => `${item.quantity}x ${toTitleCase(item.name)}`)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cartas_no_disponibles.txt";
    link.click();
    URL.revokeObjectURL(url);
    setToastMessage("Descargado");
  }, [cardsMissing]);

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <LeftColumn
        isMobile={isMobile}
        expandedListsSection={expandedListsSection}
        onToggleExpandedListsSection={handleToggleExpandedListsSection}
        lists={lists}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        filteredInventory={filteredInventory}
        listTotalsByName={listTotalsByName}
        expandedItem={expandedItem}
        onToggleExpandedItem={setExpandedItem}
        listsWithItemByName={listsWithItemByName}
        onToggleListInUse={handleToggleInUse}
      />

      {(!isMobile || showResults) && (
        <>
          <View style={[styles.column, isMobile && styles.columnMobileResults]}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>Cartas disponibles</Text>
              <Pressable style={styles.copyIconButton} onPress={handleCopyCardsYouHave}>
                <Text style={styles.copyIcon}>📋</Text>
              </Pressable>
              <Pressable style={styles.downloadIconButton} onPress={handleDownloadCardsYouHave}>
                <Text style={styles.downloadIcon}>⬇️</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.scroll}>
              {cardsYouHave.length === 0 ? (
                <Text style={styles.empty}>No hay cartas</Text>
              ) : (
                cardsYouHave.map((item, i) => (
                  <View key={`${item.name}-${item.tag ?? ""}-${i}`} style={styles.cardRow}>
                    <Text style={styles.cardName}>
                      {item.quantity}x {toTitleCase(item.name)}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
          <View style={[styles.column, isMobile && styles.columnMobileResults]}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>Cartas no disponibles</Text>
              <Pressable style={styles.copyIconButton} onPress={handleCopyCardsMissing}>
                <Text style={styles.copyIcon}>📋</Text>
              </Pressable>
              <Pressable style={styles.downloadIconButton} onPress={handleDownloadCardsMissing}>
                <Text style={styles.downloadIcon}>⬇️</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.scroll}>
              {cardsMissing.length === 0 ? (
                <Text style={styles.empty}>No hay cartas</Text>
              ) : (
                cardsMissing.map((item, i) => (
                  <View key={`${item.name}-${item.tag ?? ""}-${i}`} style={styles.cardRow}>
                    <Text style={styles.cardName}>
                      {item.quantity}x {toTitleCase(item.name)}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </>
      )}
      
      {isMobile ? (
        <ScrollView style={[styles.column, styles.columnMobileBottom]}>
          <Text style={styles.columnTitle}>Lista deseada</Text>
          <View style={styles.checkButtonWrapper}>
            <Button title="Comprobar" onPress={handleCheckDesiredList} />
          </View>
          <TextArea
            value={textAreaValue}
            onChangeText={setTextAreaValue}
            onKeyPress={handleTextAreaKeyPress}
            placeholder="e.g. 3x Card A&#10;2x Card B"
            style={styles.mobileTextArea}
          />
        </ScrollView>
      ) : (
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Lista deseada</Text>
          <View style={styles.checkButtonWrapper}>
            <Button title="Comprobar" onPress={handleCheckDesiredList} />
          </View>
          <TextArea
            value={textAreaValue}
            onChangeText={setTextAreaValue}
            onKeyPress={handleTextAreaKeyPress}
            placeholder="e.g. 3x Card A&#10;2x Card B"
          />
        </View>
      )}
      <Toast
        message={toastMessage || ""}
        visible={toastMessage !== null}
        onHide={() => setToastMessage(null)}
      />
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
    overflow: "scroll",
  },
  column: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  columnMobileTop: {
    flex: 0,
    minHeight: "50%",
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  columnMobileBottom: {
    flex: 0,
    minHeight: "50%",
    borderRightWidth: 0,
  },
  columnMobileResults: {
    minHeight: "20%",
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 4,
  },
  mobileTextArea: {
    flex: 1,
    minHeight: undefined,
  },
  checkButtonWrapper: {
    marginBottom: 5,
  },
  columnTitle: { fontWeight: "bold", marginBottom: 8 },
  columnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  copyIconButton: {
    padding: 4,
  },
  copyIcon: {
    fontSize: 20,
  },
  downloadIconButton: {
    padding: 4,
    marginLeft: 4,
  },
  downloadIcon: {
    fontSize: 20,
  },
  scroll: { flex: 1 },
  scrollMobile: { maxHeight: 225 },
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
  listsHeaderButton: { paddingVertical: 4 },
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkboxCheck: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  checkboxText: {
    fontSize: 13,
    flex: 1,
  },
});

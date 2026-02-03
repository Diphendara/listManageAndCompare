/**
 * Left column per specs.md §7: Inventory view + search.
 */

import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
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
}: InventoryViewProps): React.JSX.Element {
  const filtered = filterInventory(inventory, searchQuery);

  return (
    <View style={styles.column}>
      <FileImportButton
        title="Import inventory.json"
        onFileRead={onImportFile}
      />
      <SearchBar
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Search"
      />
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
});

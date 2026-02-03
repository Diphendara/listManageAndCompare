/**
 * Inventory section per specs.md §7: three vertical columns.
 * Left: Inventory view + search | Center: Change summary (informational) | Right: Change list (add / remove).
 */

import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import type { Inventory } from "../../models/Inventory";
import type { Item } from "../../models/Item";
import type { InventoryService } from "../../services/inventoryService";
import { parseText } from "../../parsers/itemParser";
import { mergeItemsIntoInventory } from "../../utils/inventoryMerge";
import { removeItemsFromInventory } from "../../utils/inventoryRemove";
import { importJsonInventory } from "../../utils/jsonImporter";
import { formatItem } from "../../utils/itemFormat";
import { InventoryView } from "./InventoryView";
import { ChangeSummary } from "./ChangeSummary";
import { ChangeListPanel } from "./ChangeListPanel";

export interface InventoryScreenProps {
  inventoryService: InventoryService;
  refreshTrigger?: number;
}

export function InventoryScreen({
  inventoryService,
  refreshTrigger,
}: InventoryScreenProps): React.JSX.Element {
  const [inventory, setInventory] = useState<Inventory>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [changeListText, setChangeListText] = useState("");
  const [addedItems, setAddedItems] = useState<Item[]>([]);
  const [removedItems, setRemovedItems] = useState<Item[]>([]);

  const loadInventory = useCallback(async () => {
    const data = await inventoryService.loadInventory();
    setInventory(data);
  }, [inventoryService]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory, refreshTrigger]);

  const handleApply = useCallback(async () => {
    const result = parseText(changeListText);
    if (!result.ok) return;
    if (result.items.length === 0) return;
    const next = mergeItemsIntoInventory(inventory, result.items);
    await inventoryService.saveInventory(next);
    setInventory(next);
    setChangeListText("");
    setAddedItems(result.items);
    setRemovedItems([]);
  }, [inventory, changeListText, inventoryService]);

  const handleRemove = useCallback(async () => {
    const result = parseText(changeListText);
    if (!result.ok) return;
    if (result.items.length === 0) return;

    const removeResult = removeItemsFromInventory(inventory, result.items);
    await inventoryService.saveInventory(removeResult.inventory);
    setInventory(removeResult.inventory);

    // Keep only items that were NOT removed (i.e., not found in inventory)
    const remainingText = result.items
      .filter((item) => {
        const key = `${item.name}|${item.tag ?? ""}`;
        return !removeResult.removedKeys.has(key);
      })
      .map(formatItem)
      .join("\n");

    setChangeListText(remainingText);
    // Set removed items to only those that were actually removed
    const removedItemsList = result.items.filter((item) => {
      const key = `${item.name}|${item.tag ?? ""}`;
      return removeResult.removedKeys.has(key);
    });
    setRemovedItems(removedItemsList);
    setAddedItems([]);
  }, [inventory, changeListText, inventoryService]);

  const handleImportInventory = useCallback(() => {
    // Reload inventory from the underlying storage (inventory.json or adapter).
    void loadInventory();
  }, [loadInventory]);

  const handleImportFile = useCallback(
    async (fileContent: string) => {
      const result = importJsonInventory(fileContent);
      if (!result.ok) {
        Alert.alert("Import Error", result.error);
        return;
      }

      try {
        // Replace entire inventory with imported data
        await inventoryService.saveInventory(result.inventory);
        setInventory(result.inventory);
        Alert.alert("Success", `Imported ${result.inventory.length} item(s)`);
      } catch (err) {
        Alert.alert(
          "Save Error",
          err instanceof Error ? err.message : "Unknown error"
        );
      }
    },
    [inventoryService]
  );

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <InventoryView
          inventory={inventory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onImportFile={handleImportFile}
        />
      </View>
      <View style={styles.column}>
        <ChangeSummary
          addedItems={addedItems}
          removedItems={removedItems}
        />
      </View>
      <View style={styles.column}>
        <ChangeListPanel
          changeListText={changeListText}
          onChangeListText={setChangeListText}
          onAdd={handleApply}
          onRemove={handleRemove}
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
  },
});

/**
 * Inventory section per specs.md §7: three vertical columns.
 * Left: Inventory view + search | Center: Change summary (informational) | Right: Change list (add / remove).
 */

import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert, useWindowDimensions, ScrollView, Pressable, Text } from "react-native";
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
import { Card } from "../../components/Card";

export interface InventoryScreenProps {
  inventoryService: InventoryService;
  refreshTrigger?: number;
}

export function InventoryScreen({
  inventoryService,
  refreshTrigger,
}: InventoryScreenProps): React.JSX.Element {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  const [inventory, setInventory] = useState<Inventory>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [changeListText, setChangeListText] = useState("");
  const [addedItems, setAddedItems] = useState<Item[]>([]);
  const [removedItems, setRemovedItems] = useState<Item[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Check if there are actual changes (added/removed items)
  const hasChanges = addedItems.length > 0 || removedItems.length > 0;

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

  const handleExportInventory = useCallback(() => {
    setShowExportDialog(true);
  }, []);

  const handleExportJSON = useCallback(() => {
    const jsonString = JSON.stringify(inventory, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory.json";
    link.click();
    URL.revokeObjectURL(url);
    setShowExportDialog(false);
  }, [inventory]);

  const handleExportTXT = useCallback(() => {
    const textLines = inventory.map((item) => `${item.quantity}x ${item.name}`);
    const text = textLines.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory.txt";
    link.click();
    URL.revokeObjectURL(url);
    setShowExportDialog(false);
  }, [inventory]);

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <View style={[styles.column, isMobile && styles.columnMobile]}>
        <InventoryView
          inventory={inventory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onImportFile={handleImportFile}
          onExportInventory={handleExportInventory}
          showExportDialog={showExportDialog}
          onExportJSON={handleExportJSON}
          onExportTXT={handleExportTXT}
          onCancelExport={() => setShowExportDialog(false)}
        />
      </View>
      {!isMobile && (
        <View style={styles.column}>
          <ChangeSummary
            addedItems={addedItems}
            removedItems={removedItems}
          />
        </View>
      )}
      {!isMobile ? (
        <View style={styles.column}>
          <ChangeListPanel
            changeListText={changeListText}
            onChangeListText={setChangeListText}
            onAdd={handleApply}
            onRemove={handleRemove}
          />
        </View>
      ) : (
        <ScrollView style={[styles.column, styles.mobileChangePanel]}>
          {hasChanges && (
            <ChangeSummary
              addedItems={addedItems}
              removedItems={removedItems}
            />
          )}
          <ChangeListPanel
            changeListText={changeListText}
            onChangeListText={setChangeListText}
            onAdd={handleApply}
            onRemove={handleRemove}
            isMobile={true}
          />
        </ScrollView>
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
  columnMobile: {
    flex: 0.6,
  },
  mobileChangePanel: {
    flex: 0.4,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
});

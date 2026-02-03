/**
 * Center column per specs.md §7: Change summary (informational).
 * Shows two separate sections: Added and Removed.
 * Sections highlight in their colors only when operations are executed.
 */

import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { formatItem } from "../../utils/itemFormat";
import type { Item } from "../../models/Item";

export interface ChangeSummaryProps {
  addedItems: Item[];
  removedItems: Item[];
}

export function ChangeSummary({
  addedItems,
  removedItems,
}: ChangeSummaryProps): React.JSX.Element {
  const hasAdded = addedItems.length > 0;
  const hasRemoved = removedItems.length > 0;

  return (
    <View style={styles.column}>
      <Text style={styles.title}>Change summary</Text>

      {/* Added Section */}
      <View
        style={[
          styles.section,
          hasAdded
            ? { backgroundColor: "#e8f5e9", borderColor: "#4caf50" }
            : { backgroundColor: "#f5f5f5", borderColor: "#ccc" },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            hasAdded ? { color: "#2e7d32" } : { color: "#999" },
          ]}
        >
          ➕ Added ({addedItems.length})
        </Text>
        <ScrollView style={styles.sectionScroll}>
          {addedItems.length === 0 ? (
            <Text style={styles.empty}>No items</Text>
          ) : (
            addedItems.map((item, i) => (
              <Text key={i} style={styles.line}>
                {formatItem(item)}
              </Text>
            ))
          )}
        </ScrollView>
      </View>

      {/* Removed Section */}
      <View
        style={[
          styles.section,
          hasRemoved
            ? { backgroundColor: "#ffebee", borderColor: "#f44336" }
            : { backgroundColor: "#f5f5f5", borderColor: "#ccc" },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            hasRemoved ? { color: "#c62828" } : { color: "#999" },
          ]}
        >
          ➖ Removed ({removedItems.length})
        </Text>
        <ScrollView style={styles.sectionScroll}>
          {removedItems.length === 0 ? (
            <Text style={styles.empty}>No items</Text>
          ) : (
            removedItems.map((item, i) => (
              <Text key={i} style={styles.line}>
                {formatItem(item)}
              </Text>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, padding: 8, flexDirection: "column" },
  title: { fontWeight: "bold", marginBottom: 8 },
  section: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 14, marginBottom: 4 },
  sectionScroll: { flex: 1 },
  empty: { color: "#999", padding: 4, fontSize: 12 },
  line: { paddingVertical: 2, fontSize: 12 },
});

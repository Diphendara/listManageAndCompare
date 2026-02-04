/**
 * List preview panel per specs.md §8.
 * Center column: shows the decklist of the selected list.
 */

import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { formatListItem } from "../../utils/listItemFormat";
import type { CustomList } from "../../models/CustomList";

export interface ListPreviewProps {
  selectedList: CustomList | null;
  onDownloadAllLists: () => void;
}

export function ListPreview({ selectedList, onDownloadAllLists }: ListPreviewProps): React.JSX.Element {
  return (
    <View style={styles.column}>
      <View style={styles.header}>
        <Text style={styles.title}>Preview</Text>
        <Button title="Descargar todas" onPress={onDownloadAllLists} />
      </View>
      <ScrollView style={styles.scroll}>
        {!selectedList ? (
          <Text style={styles.empty}>Select a list</Text>
        ) : selectedList.decklist.length === 0 ? (
          <Text style={styles.empty}>No items in list</Text>
        ) : (
          selectedList.decklist.map((item, i) => (
            <Card key={i}>
              <Text>{formatListItem(item)}</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, padding: 8 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { fontWeight: "bold" },
  scroll: { flex: 1 },
  empty: { color: "#666", padding: 8 },
});

/**
 * Right column per specs.md §7: Change list (add / remove).
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextArea } from "../../components/TextArea";
import { Button } from "../../components/Button";

export interface ChangeListPanelProps {
  changeListText: string;
  onChangeListText: (value: string) => void;
  onAdd: () => void;
  onRemove: () => void;
}

export function ChangeListPanel({
  changeListText,
  onChangeListText,
  onAdd,
  onRemove,
}: ChangeListPanelProps): React.JSX.Element {
  return (
    <View style={styles.column}>
      <Text style={styles.title}>Change list</Text>
      <TextArea
        value={changeListText}
        onChangeText={onChangeListText}
        placeholder="e.g. 3x Screws #metal"
      />
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button title="Añadir" onPress={onAdd} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Eliminar" onPress={onRemove} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, padding: 8 },
  title: { fontWeight: "bold", marginBottom: 8 },
  buttonContainer: { flexDirection: "row", gap: 8 },
  buttonWrapper: { flex: 1 },
});

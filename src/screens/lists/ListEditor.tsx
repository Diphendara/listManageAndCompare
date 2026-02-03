/**
 * List editor panel per specs.md §8.
 * Right column: textarea to edit/create lists with buttons "Crear lista" and "Actualizar lista".
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextArea } from "../../components/TextArea";
import { Button } from "../../components/Button";

export interface ListEditorProps {
  editorText: string;
  onEditorTextChange: (value: string) => void;
  onCreateList: () => void;
  onUpdateList: () => void;
  hasSelectedList: boolean;
  listName?: string;
  onListNameChange?: (v: string) => void;
}

export function ListEditor({
  editorText,
  onEditorTextChange,
  onCreateList,
  onUpdateList,
  hasSelectedList,
  listName,
  onListNameChange,
}: ListEditorProps): React.JSX.Element {
  return (
    <View style={styles.column}>
      <Text style={styles.title}>Create / Edit List</Text>
      {hasSelectedList && (
        <TextInput
          style={styles.nameInput}
          value={listName}
          onChangeText={onListNameChange}
          placeholder="Nombre de la lista"
        />
      )}
      <TextArea
        value={editorText}
        onChangeText={onEditorTextChange}
        placeholder="e.g. 3x Item A&#10;2x Item B"
      />
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button title="Crear lista" onPress={onCreateList} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title="Actualizar lista"
            onPress={onUpdateList}
            disabled={!hasSelectedList}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, padding: 8 },
  title: { fontWeight: "bold", marginBottom: 8 },
  nameInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 8,
  },
  buttonContainer: { flexDirection: "row", gap: 8 },
  buttonWrapper: { flex: 1 },
});

import React from "react";
import { TextInput, StyleSheet } from "react-native";

export interface TextAreaProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

export function TextArea({
  value,
  onChangeText,
  placeholder,
}: TextAreaProps): React.JSX.Element {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    minHeight: 600,
    textAlignVertical: "top",
  },
});

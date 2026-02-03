import React from "react";
import { TextInput, StyleSheet, type TextInputProps } from "react-native";

export interface TextAreaProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  style?: any;
  onPaste?: () => void;
  onKeyPress?: TextInputProps["onKeyPress"];
}

export function TextArea({
  value,
  onChangeText,
  placeholder,
  style,
  onPaste,
  onKeyPress,
}: TextAreaProps): React.JSX.Element {
  return (
    <TextInput
      style={[styles.input, style]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline
      onPaste={onPaste}
      onKeyPress={onKeyPress}
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

import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function Button({ title, onPress, disabled = false }: ButtonProps): React.JSX.Element {
  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    backgroundColor: "#ddd",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#f0f0f0",
    opacity: 0.5,
  },
  text: { fontSize: 16 },
  textDisabled: { color: "#999" },
});

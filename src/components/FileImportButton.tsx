/**
 * File import button for JSON files (web-compatible).
 * Allows users to select and read JSON files from their system.
 */

import React, { useRef } from "react";
import { Button } from "./Button";

export interface FileImportButtonProps {
  onFileRead: (content: string) => void;
  accept?: string;
  title?: string;
}

export function FileImportButton({
  onFileRead,
  accept = ".json",
  title = "Import File",
}: FileImportButtonProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        onFileRead(content);
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be imported again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <Button
        title={title}
        onPress={() => inputRef.current?.click()}
      />
    </>
  );
}

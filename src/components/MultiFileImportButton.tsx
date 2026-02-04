/**
 * Multi-file import button for JSON/TXT files (web-compatible).
 * Allows users to select multiple files from their system.
 */

import React, { useRef } from "react";
import { Button } from "./Button";

export interface FileContent {
  name: string;
  content: string;
}

export interface MultiFileImportButtonProps {
  onFilesRead: (files: FileContent[]) => void;
  accept?: string;
  title?: string;
}

export function MultiFileImportButton({
  onFilesRead,
  accept = ".json,.txt",
  title = "Import Files",
}: MultiFileImportButtonProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileContents: FileContent[] = [];

    // Read all files
    const readPromises = Array.from(files).map((file) => {
      return new Promise<FileContent>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result;
          if (typeof content === "string") {
            resolve({ name: file.name, content });
          } else {
            reject(new Error(`Failed to read ${file.name}`));
          }
        };
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsText(file);
      });
    });

    try {
      const results = await Promise.all(readPromises);
      fileContents.push(...results);
      onFilesRead(fileContents);
    } catch (err) {
      console.error("Error reading files:", err);
    }

    // Reset input so the same files can be imported again
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
        multiple
        style={{ display: "none" }}
      />
      <Button
        title={title}
        onPress={() => inputRef.current?.click()}
      />
    </>
  );
}

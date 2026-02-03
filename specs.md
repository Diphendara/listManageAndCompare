# Application Technical Specification (specs.md)

## 1. Overview

This document defines the full technical specification for the **Application** (hereafter referred to as the *app*).

The app will be developed by a single developer on **Windows 11**, using **React Native**, starting with a **web version** and later adapted to **Android** (and potentially desktop platforms such as Windows/macOS).

The app is **offline-first** and does not require an internet connection for any of its core functionality.

---

## 2. Core Principles

- **Offline-only**: All functionality must work without internet access.
- **Local persistence**: All data is stored locally using JSON files.
- **Single codebase**: React Native for Web first, then adapted to Android.
- **Text-driven workflows**: Items are created and edited primarily via plain text input.
- **Explicit behavior**: No silent auto-corrections or hidden logic.

---

## 3. Technology Stack

- **Framework**: React Native (with Web support)
- **Target platforms**:
  - Web (initial)
  - Android (future)
  - Windows/macOS (possible future)
- **Development OS**: Windows 11
- **Storage**: Local file system (JSON files)

---

## 4. Navigation Model (Web)

- The web version is a **single-page application (SPA)**.
- Three persistent top-level tabs are always visible:
  1. **Inventory**
  2. **Custom Lists**
  3. **Comparisons**
- Switching tabs **must not reset or lose state** from other sections.

---

## 5. Item Data Model

### 5.1 Text Format

All items are represented in text using the following format:

[Quantity]x [Name] #[TAG]

Rules:
- Quantity: integer, max 3 digits
- Name: one or more words
- Tag: optional, single word, prefixed with #

---

### 5.2 JSON Representation

{
  "quantity": 3,
  "name": "Screws",
  "tag": "metal"
}

---

## 6. Inventory Concept

- The Inventory is the canonical collection of all items.
- Stored in `inventory.json`
- Structure: array of item objects

---

## 7. Inventory Section

Three vertical columns:
- Left: Inventory view + search
- Center: Change summary (informational)
- Right: Change list (add / remove)

Backup rule:
- Every change creates `inventory_backup_DD_MM_YY_HH_MM.json`

---

## 8. Custom Lists Section

Three vertical columns:
- Left: List cards overview
- Center: Selected list preview
- Right: List creation / editing via textarea

Each list:
- Stored as its own JSON file
- Has `name`, `inUse`, and `decklist`

A derived file `listsInUse.json` stores all active list filenames.

---

## 9. Comparisons Section

Reserved for future use.
No behavior defined yet.

---

## 10. Parsing Rules

- Ignore empty lines
- Reject invalid formats
- No auto-correction
- Abort operation if errors exist

---

## 11. Persistence Rules

- Atomic read → modify → write
- Human-readable JSON
- No concurrency assumptions

---

## 12. Non-Goals

- No authentication
- No cloud sync
- No backend
- No advanced UI or animations

---

## 13. Specification Authority

This document is the **single source of truth**.
All ambiguous behavior must be resolved here before coding.

End of specification.

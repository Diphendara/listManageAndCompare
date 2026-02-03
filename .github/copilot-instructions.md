# Copilot Instructions for ListManageAndCompare

## Project Context

**ListManageAndCompare** is an offline-first React Native web app (expandable to Android) for managing inventory items and custom lists. All data persists locally to JSON files. The app enforces explicit, predictable behavior with no silent auto-corrections.

**Key Tech**: React Native, TypeScript, Expo (web-first), in-memory storage adapter for testing.

---

## Architecture Overview

### Three-Tier Stack

1. **Models** (`src/models/`): Core data structures
   - `Item`: `{ quantity, name, tag? }` — matches text format `[Qty]x [Name] #[TAG]`
   - `Inventory`: `Item[]` — canonical single source of truth

2. **Services** (`src/services/`):
   - `StorageService`: High-level atomic read-modify-write JSON I/O (creates temp file, renames on success)
   - `InventoryService`: Loads/saves inventory + auto-creates timestamped backups
   - `FileSystemAdapter`: Abstraction (in-memory for web, real FS for native)

3. **UI Layer** (`src/screens/`, `src/components/`):
   - Three persistent top-level tabs (Inventory, Custom Lists, Comparisons)
   - No state reset when switching tabs
   - Layout: three vertical columns per screen (left, center, right)

### Data Flow Pattern

```
User Input → Parser (itemParser.ts) → Validation (strict, fail-first)
  → Merge (inventoryMerge.ts) → InventoryService.saveInventory()
  → Both inventory.json + backup written atomically
  → UI setState() refreshes display
```

---

## Critical Conventions

### 1. Item Parsing (Non-Negotiable Rules)

Located in [src/parsers/itemParser.ts](src/parsers/itemParser.ts):
- Format: `[Qty]x [Name] #[Tag]` OR `[Qty] [Name] #[Tag]` (both accepted)
- Qty: 1–999, no leading zeros
- Tag: optional, single word, prefixed with `#`
- **Abort on first invalid line** (specs §10) — no partial results, no auto-corrections
- Empty lines are ignored (not errors)
- Return type: `ParseTextResult = { ok: true; items } | { ok: false; error }`

### 2. Inventory Persistence (Specs §6–7)

- **Single file**: `inventory.json` (root of app, resolved via `StorageService`)
- **Every save creates backup**: `inventory_backup_DD_MM_YY_HH_MM.json` (e.g., `inventory_backup_02_02_26_14_30.json`)
- Backup timestamp from [src/utils/dateUtils.ts](src/utils/dateUtils.ts): `getBackupDateString()`
- Atomic writes: temp file + rename (ensures no corruption on crash)
- JSON always indented (2 spaces) for human readability

### 3. Merging Logic

[src/utils/inventoryMerge.ts](src/utils/inventoryMerge.ts) handles adding/updating/removing items:
- **Idempotency**: If an item (by name + tag) exists, update quantity; else append
- Preserves existing items not in the change list
- Returns new inventory array (immutable pattern)

### 4. Screen Structure Pattern

Three columns (e.g., [src/screens/inventory/InventoryScreen.tsx](src/screens/inventory/InventoryScreen.tsx)):
- **Left**: Primary content (list view + search)
- **Center**: Summary/metadata (read-only)
- **Right**: Editor panel (textarea or form)

All state managed at screen level; columns communicate via callbacks.

---

## Development Workflow

### Setup
```bash
npm install
npm start          # Starts Expo dev server (web + native)
npm run web        # Web only
npm run android    # Android simulator
```

### Key File Locations for Common Tasks

| Task | File |
|------|------|
| Add new item property | [src/models/Item.ts](src/models/Item.ts) |
| Extend text format parser | [src/parsers/itemParser.ts](src/parsers/itemParser.ts) |
| Change backup/inventory logic | [src/services/inventoryService.ts](src/services/inventoryService.ts) + [src/constants/paths.ts](src/constants/paths.ts) |
| Add new screen tab | [src/screens/](src/screens/) + update [src/app/App.tsx](src/app/App.tsx) |
| Inventory merge rules | [src/utils/inventoryMerge.ts](src/utils/inventoryMerge.ts) |
| Date/time formatting | [src/utils/dateUtils.ts](src/utils/dateUtils.ts) |

### Testing & Validation

- **Adapter pattern**: [src/services/inMemoryStorage.ts](src/services/inMemoryStorage.ts) provides `FileSystemAdapter` for tests (no real FS needed)
- **Type safety**: Strict TypeScript (`tsconfig.json`) — leverage interfaces over implementations
- **Explicit errors**: Parsers return `{ ok, error }` objects; no exceptions for user input errors

---

## Integration Points & Dependencies

### External: Expo + React Native
- All UI components inherit from RN (`View`, `Text`, `StyleSheet`, etc.)
- Web runs via Metro bundler; adapt carefully for Android (async APIs differ)

### Internal: How Components Connect

- `App.tsx` instantiates adapters & services (dependency injection)
- Services are immutable and passed as props
- State lifted to screen level; UI components are stateless (`ScreenProps` interfaces)
- No global state/context yet (consider if custom lists expand)

### Specs.md as Source of Truth

Refer to [specs.md](specs.md) for:
- Item data model (§5)
- Inventory concept (§6)
- Inventory UI layout (§7)
- Custom lists structure (§8)
- Parsing rules (§10)
- Persistence rules (§11)

---

## Common Pitfalls

1. **Mutating inventory directly**: Always use `mergeItemsIntoInventory(old, items)` — returns new array
2. **Forgetting backups**: `InventoryService.saveInventory()` writes both files; don't skip
3. **Silent auto-corrections**: If user input is invalid, abort and show error (never guess/fix)
4. **Tab state loss**: New tabs must preserve state from other sections (use `useState` at screen, not page level)
5. **Case sensitivity in tags**: No normalization — `#metal` ≠ `#Metal`

---

## Code Style & Patterns

- **Naming**: CamelCase for components, camelCase for functions/vars, SCREAMING_SNAKE_CASE for constants
- **Types**: Define interfaces in `src/types/` or alongside models; avoid `any`
- **Comments**: Specs references (e.g., "per §5.2") help future readers understand intent
- **Imports**: Use named imports; absolute paths via module resolution (configured in tsconfig)

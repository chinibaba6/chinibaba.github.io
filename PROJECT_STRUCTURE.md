# Local Message Editor - Project Structure

## 📁 File Organization (v3.3.0+)

The plugin is now organized into separate modules for better maintainability:

```
src/
├── index.tsx                    # Main plugin entry point (onLoad/onUnload)
├── storage.tsx                  # Storage helpers (initStorage, setEdit, getEdit, etc.)
├── styles.tsx                   # All StyleSheet definitions
├── utils.tsx                    # Utility functions (modal state management)
├── components/
│   ├── EditModal.tsx           # Modal component for editing messages
│   └── SettingsPage.tsx        # Settings page component
└── patches/
    └── actionSheet.tsx         # Action sheet patching logic (dislate pattern)
```

## 📦 Module Responsibilities

### `index.tsx`
- Main plugin export
- `onLoad()` - Initializes plugin, applies patches
- `onUnload()` - Cleanup
- Patches `MessageStore.getMessage` and `MessageStore.getMessages`
- Exports `Settings` component

### `storage.tsx`
- `initStorage()` - Initialize storage structure
- `setEdit(messageId, content)` - Save local edit
- `getEdit(messageId)` - Get local edit
- `hasEdit(messageId)` - Check if message has local edit
- `clearEdit(messageId)` - Remove local edit
- Exports `storage` object

### `styles.tsx`
- `styles` - Main StyleSheet for UI components
- `iconStyles` - Icon-specific styles for action sheet

### `utils.tsx`
- `registerModalState()` - Register modal state setters
- `unregisterModalState()` - Cleanup modal state
- `showEditModal(message)` - Show edit modal for a message

### `components/EditModal.tsx`
- Modal UI for editing message content
- Save/Clear/Cancel buttons
- Dispatches `MESSAGE_UPDATE` events

### `components/SettingsPage.tsx`
- Settings UI for manual message editing
- Message ID input method
- List of currently edited messages
- Instructions for users

### `patches/actionSheet.tsx`
- Patches Discord's message long-press menu
- Adds "Edit Locally" button
- Uses dislate plugin pattern for compatibility
- Detailed logging for debugging

## 🔄 Data Flow

1. **User long-presses a message** → `actionSheet.tsx` intercepts
2. **User taps "Edit Locally"** → `showEditModal()` from `utils.tsx`
3. **Modal opens** → `EditModal.tsx` component
4. **User edits and saves** → `setEdit()` from `storage.tsx`
5. **FluxDispatcher** updates → Discord re-renders message
6. **MessageStore patches** → `getEdit()` replaces content

## 🛠️ Benefits of Modular Structure

- ✅ **Easier to maintain** - Each file has a single responsibility
- ✅ **Better debugging** - Issues isolated to specific modules
- ✅ **Reusable code** - Components can be imported independently
- ✅ **Cleaner codebase** - Main index.tsx is now ~100 lines vs 600+
- ✅ **Future-proof** - Easy to add new features without bloating single file

## 📚 Import Pattern

All modules use CommonJS (`require`/`module.exports`) since Revenge doesn't support ES6 imports:

```javascript
// Instead of:
import { setEdit } from "./storage";

// We use:
const storageModule = require("./storage");
const { setEdit } = storageModule;
```

## 🔍 Debugging

Each module logs to console with `[LocalMessageEditor]` prefix:
- Look for logs in Discord developer console
- Filter by "LocalMessageEditor" to see plugin activity
- Action sheet patch has detailed step-by-step logging


// ============================================================================
// LOCAL MESSAGE EDITOR - REVENGE/VENDETTA PLUGIN
// ============================================================================
// 
// ✅ v3.3.0: Modular architecture (separate files)
//
// This plugin allows you to edit Discord messages locally without sending
// changes to the server. Your edits are only visible to you on your device.
//
// ============================================================================

const { findByStoreName } = vendetta.metro;
const { after } = vendetta.patcher;
const { showToast } = vendetta.ui.toasts;

// Import modules
const storageModule = require("./storage");
const { initStorage, getEdit, hasEdit } = storageModule;

const EditModal = require("./components/EditModal").default;
const SettingsPage = require("./components/SettingsPage").default;
const patchActionSheet = require("./patches/actionSheet").default;

// Find stores
const MessageStore = findByStoreName("MessageStore");

// Store unpatches
const unpatches = [];

// Main plugin export
module.exports = {
  onLoad() {
    console.log("[LocalMessageEditor] ========================================");
    console.log("[LocalMessageEditor] Loading v3.3.0 (Modular)...");
    console.log("[LocalMessageEditor] ========================================");
    
    try {
      initStorage();
      console.log("[LocalMessageEditor] ✓ Storage initialized");
      
      if (!MessageStore) {
        throw new Error("MessageStore not found");
      }

      // Patch getMessage
      if (MessageStore.getMessage) {
        unpatches.push(after(MessageStore, "getMessage", (args, res) => {
          if (res?.id && hasEdit(res.id)) {
            return { ...res, content: getEdit(res.id) || res.content };
          }
          return res;
        }));
        console.log("[LocalMessageEditor] ✓ Patched getMessage");
      }

      // Patch getMessages
      if (MessageStore.getMessages) {
        unpatches.push(after(MessageStore, "getMessages", (args, res) => {
          if (!res) return res;
          const messages = res._array || res;
          if (Array.isArray(messages)) {
            const edited = messages.map((msg) => {
              if (msg?.id && hasEdit(msg.id)) {
                return { ...msg, content: getEdit(msg.id) || msg.content };
              }
              return msg;
            });
            return res._array ? { ...res, _array: edited } : edited;
          }
          return res;
        }));
        console.log("[LocalMessageEditor] ✓ Patched getMessages");
      }

      // Try action sheet patch
      const actionSheetPatch = patchActionSheet();
      if (actionSheetPatch) {
        unpatches.push(actionSheetPatch);
        console.log("[LocalMessageEditor] ✓ Action sheet patch applied");
      } else {
        console.log("[LocalMessageEditor] ⚠ Action sheet patch skipped (use Settings)");
      }

      console.log("[LocalMessageEditor] ========================================");
      console.log("[LocalMessageEditor] ✅ LOADED! Use Settings to edit messages");
      console.log("[LocalMessageEditor] ========================================");
      showToast("LocalMessageEditor loaded! Check Settings", "success");
      
    } catch (error) {
      console.error("[LocalMessageEditor] ❌ LOAD ERROR:", error);
      showToast("Error: " + error.message, "error");
    }
  },

  onUnload() {
    console.log("[LocalMessageEditor] Unloading...");
    unpatches.forEach((u) => { try { u() } catch(e) {} });
    unpatches.length = 0;
    
    // Unregister modal state (handled in EditModal cleanup)
    console.log("[LocalMessageEditor] Unloaded");
  },
  
  Settings: SettingsPage
};

// ============================================================================
// LOCAL MESSAGE EDITOR - REVENGE/VENDETTA PLUGIN
// ============================================================================
// 
// ✅ v3.0.0: Complete rewrite using EXACT Antied pattern
//
// This plugin allows you to edit Discord messages locally without sending
// changes to the server. Your edits are only visible to you on your device.
//
// ============================================================================

const { storage } = vendetta.plugin;
const { findByProps } = vendetta.metro;
const { before, after } = vendetta.patcher;
const { showToast } = vendetta.ui.toasts;
const { React, ReactNative, FluxDispatcher } = vendetta.metro.common;
const { getAssetIDByName } = vendetta.ui.assets;
const { findInReactTree } = vendetta.utils;

const { View, Text, TextInput, Pressable, StyleSheet, Modal } = ReactNative;

// Find modules exactly like Antied
const ActionSheet = findByProps("openLazy", "hideActionSheet");
const MessageStore = findByProps("getMessage", "getMessages");
const ActionSheetRowModule = findByProps("ActionSheetRow");
const ActionSheetRow = ActionSheetRowModule?.ActionSheetRow;

// Storage helpers
function initStorage() {
  if (!storage.edits) {
    storage.edits = {};
  }
}

function setEdit(messageId, content) {
  if (!storage.edits) storage.edits = {};
  storage.edits[messageId] = content;
}

function getEdit(messageId) {
  return storage.edits?.[messageId];
}

function hasEdit(messageId) {
  return messageId in (storage.edits || {});
}

function clearEdit(messageId) {
  if (!storage.edits) return;
  delete storage.edits[messageId];
}

// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#2f3136",
    borderRadius: 8,
    padding: 16,
    margin: 16,
    width: "90%",
    maxWidth: 500,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#40444b",
    color: "#dcddde",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    flex: 1,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#5865f2",
  },
  clearButton: {
    backgroundColor: "#ed4245",
  },
  cancelButton: {
    backgroundColor: "#4e5058",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

// Modal state
let modalVisible = false;
let setModalVisible = null;
let currentMessage = null;
let setCurrentMessage = null;

// Modal component
function EditModal() {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [newContent, setNewContent] = React.useState("");

  React.useEffect(() => {
    setModalVisible = setVisible;
    setCurrentMessage = (msg) => {
      setMessage(msg);
      if (msg) {
        setNewContent(getEdit(msg.id) || msg.content);
      }
    };
    return () => {
      setModalVisible = null;
      setCurrentMessage = null;
    };
  }, []);

  const handleSave = () => {
    if (!message) return;
    setEdit(message.id, newContent);
    
    // Dispatch MESSAGE_UPDATE to refresh the UI
    FluxDispatcher.dispatch({
      type: "MESSAGE_UPDATE",
      message: {
        ...message,
        content: newContent,
      },
    });
    
    showToast("Message edited locally", "success");
    setVisible(false);
    setMessage(null);
  };

  const handleClear = () => {
    if (!message) return;
    clearEdit(message.id);
    
    // Dispatch MESSAGE_UPDATE to restore original
    FluxDispatcher.dispatch({
      type: "MESSAGE_UPDATE",
      message: {
        ...message,
        content: message.content,
      },
    });
    
    showToast("Edit cleared", "info");
    setVisible(false);
    setMessage(null);
  };

  const handleClose = () => {
    setVisible(false);
    setMessage(null);
  };

  if (!visible || !message) return null;

  return React.createElement(
    Modal,
    { visible: visible, transparent: true, animationType: "fade", onRequestClose: handleClose },
    React.createElement(
      View,
      { style: styles.overlay },
      React.createElement(Pressable, { style: StyleSheet.absoluteFill, onPress: handleClose }),
      React.createElement(
        View,
        { style: styles.container },
        React.createElement(Text, { style: styles.header }, "Edit Message Locally"),
        React.createElement(TextInput, {
          style: styles.input,
          value: newContent,
          onChangeText: setNewContent,
          placeholder: "Enter new message content...",
          placeholderTextColor: "#72767d",
          multiline: true,
          autoFocus: true,
        }),
        React.createElement(
          View,
          { style: styles.buttonContainer },
          React.createElement(
            Pressable,
            { style: [styles.button, styles.cancelButton], onPress: handleClose },
            React.createElement(Text, { style: styles.buttonText }, "Cancel")
          ),
          hasEdit(message.id) && React.createElement(
            Pressable,
            { style: [styles.button, styles.clearButton], onPress: handleClear },
            React.createElement(Text, { style: styles.buttonText }, "Clear")
          ),
          React.createElement(
            Pressable,
            { style: [styles.button, styles.saveButton], onPress: handleSave },
            React.createElement(Text, { style: styles.buttonText }, "Save")
          )
        )
      )
    )
  );
}

// Show modal helper
function showEditModal(message) {
  if (setCurrentMessage && setModalVisible) {
    setCurrentMessage(message);
    setModalVisible(true);
  } else {
    showToast("Modal not ready, try again", "error");
  }
}

// Store unpatches
const unpatches = [];

// Action sheet patch - EXACTLY like Antied
function patchActionSheet() {
  if (!ActionSheet || !ActionSheet.openLazy) {
    console.error("[LocalMessageEditor] ActionSheet.openLazy not found");
    return null;
  }
  
  if (!ActionSheetRow) {
    console.error("[LocalMessageEditor] ActionSheetRow not found");
    return null;
  }

  console.log("[LocalMessageEditor] Patching action sheet...");

  return before("openLazy", ActionSheet, ([component, args, actionMessage]) => {
    try {
      const message = actionMessage?.message;
      
      // EXACT check from Antied
      if (args !== "MessageLongPressActionSheet" || !message) return;
      
      console.log("[LocalMessageEditor] Intercepted message menu for:", message.id);
      
      component.then((instance) => {
        const unpatch = after("default", instance, (_, comp) => {
          try {
            // Cleanup on unmount - EXACT pattern from Antied
            React.useEffect(() => () => { unpatch() }, []);
            
            // Find buttons array - EXACT pattern from Antied
            function someFunc(a) {
              return a?.props?.label?.toLowerCase?.() == 'reply'
            }
            
            const buttons = findInReactTree(comp, c => c?.find?.(someFunc));
            
            if (!buttons) {
              console.log("[LocalMessageEditor] Buttons not found in tree");
              return comp;
            }
            
            console.log("[LocalMessageEditor] Found buttons array, adding edit button");
            
            // Find position - EXACT pattern from Antied
            const position = Math.max(
              buttons.findIndex(someFunc),
              buttons.length - 1
            );
            
            const editLabel = hasEdit(message.id) ? "Edit Locally (modified)" : "Edit Locally";
            
            // Add button - EXACT pattern from Antied using splice
            buttons.splice(position + 1, 0,
              React.createElement(ActionSheetRow, {
                label: editLabel,
                subLabel: "Local Message Editor",
                icon: React.createElement(ActionSheetRow.Icon, {
                  source: getAssetIDByName("ic_edit_24px")
                }),
                onPress: () => {
                  ActionSheet.hideActionSheet();
                  showEditModal(message);
                }
              })
            );
            
            // Add clear button if edited
            if (hasEdit(message.id)) {
              buttons.splice(position + 2, 0,
                React.createElement(ActionSheetRow, {
                  label: "Clear Local Edit",
                  subLabel: "Local Message Editor",
                  isDestructive: true,
                  icon: React.createElement(ActionSheetRow.Icon, {
                    source: getAssetIDByName("ic_message_delete")
                  }),
                  onPress: () => {
                    clearEdit(message.id);
                    ActionSheet.hideActionSheet();
                    showToast("Edit cleared", "info");
                  }
                })
              );
            }
            
            console.log("[LocalMessageEditor] Added buttons successfully");
            return comp;
            
          } catch (e) {
            console.error("[LocalMessageEditor] Error in component patch:", e);
            showToast("Error patching menu", "error");
            return comp;
          }
        });
      });
      
    } catch (e) {
      console.error("[LocalMessageEditor] Error in openLazy patch:", e);
    }
  });
}

// Main plugin export
module.exports = {
  onLoad() {
    console.log("[LocalMessageEditor] ========================================");
    console.log("[LocalMessageEditor] Loading v3.0.0...");
    console.log("[LocalMessageEditor] ========================================");
    
    try {
      initStorage();
      console.log("[LocalMessageEditor] ✓ Storage initialized");
      
      // Verify modules
      console.log("[LocalMessageEditor] ActionSheet:", !!ActionSheet);
      console.log("[LocalMessageEditor] ActionSheetRow:", !!ActionSheetRow);
      console.log("[LocalMessageEditor] MessageStore:", !!MessageStore);
      
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

      // Patch action sheet
      const actionSheetPatch = patchActionSheet();
      if (actionSheetPatch) {
        unpatches.push(actionSheetPatch);
        console.log("[LocalMessageEditor] ✓ Patched action sheet");
      } else {
        console.error("[LocalMessageEditor] ✗ Failed to patch action sheet");
        showToast("Action sheet patch failed", "error");
      }

      console.log("[LocalMessageEditor] ========================================");
      console.log("[LocalMessageEditor] ✅ LOADED SUCCESSFULLY!");
      console.log("[LocalMessageEditor] ========================================");
      showToast("LocalMessageEditor loaded! ✅", "success");
      
    } catch (error) {
      console.error("[LocalMessageEditor] ========================================");
      console.error("[LocalMessageEditor] ❌ FAILED TO LOAD");
      console.error("[LocalMessageEditor]", error);
      console.error("[LocalMessageEditor] ========================================");
      showToast("LocalMessageEditor: " + error.message, "error");
    }
  },

  onUnload() {
    console.log("[LocalMessageEditor] Unloading...");
    unpatches.forEach((unpatch) => {
      try {
        unpatch();
      } catch (e) {
        console.error("[LocalMessageEditor] Error unpatching:", e);
      }
    });
    unpatches.length = 0;
    setModalVisible = null;
    setCurrentMessage = null;
    console.log("[LocalMessageEditor] Unloaded");
  },
  
  Settings: EditModal
};

// ============================================================================
// LOCAL MESSAGE EDITOR - REVENGE/VENDETTA PLUGIN
// ============================================================================
// 
// ✅ v2.5.1: Added extensive debug logging to diagnose loading issues
//
// This plugin allows you to edit Discord messages locally without sending
// changes to the server. Your edits are only visible to you on your device.
//
// ============================================================================

const { storage } = vendetta.plugin;
const { findByProps, findByDisplayName } = vendetta.metro;
const { before, after } = vendetta.patcher;
const { showToast } = vendetta.ui.toasts;
const { React, ReactNative } = vendetta.metro.common;
const { getAssetIDByName } = vendetta.ui.assets;
const { findInReactTree } = vendetta.utils;

const { View, Text, TextInput, Pressable, StyleSheet, Modal } = ReactNative;

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
    showToast("Message edited locally", "success");
    setVisible(false);
    setMessage(null);
  };

  const handleClear = () => {
    if (!message) return;
    clearEdit(message.id);
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

// Main plugin export
module.exports = {
  onLoad() {
    console.log("[LocalMessageEditor] === START LOADING v2.5.1 ===");
    
    try {
      console.log("[LocalMessageEditor] Initializing storage...");
      initStorage();
      console.log("[LocalMessageEditor] ✓ Storage initialized");
      
      console.log("[LocalMessageEditor] Showing toast...");
      showToast("LocalMessageEditor v2.5.1 loading...", "info");
      console.log("[LocalMessageEditor] ✓ Toast shown");

      // Find MessageStore
      const MessageStore = findByProps("getMessage", "getMessages");
      if (!MessageStore) {
        console.error("[LocalMessageEditor] MessageStore not found");
        showToast("MessageStore not found", "error");
      } else {
        console.log("[LocalMessageEditor] MessageStore found");

        // Patch getMessage
        if (MessageStore.getMessage) {
          try {
            unpatches.push(after(MessageStore, "getMessage", (args, res) => {
              try {
                if (res?.id && hasEdit(res.id)) {
                  return { ...res, content: getEdit(res.id) || res.content };
                }
              } catch (e) {
                console.error("[LocalMessageEditor] Error in getMessage patch:", e);
              }
              return res;
            }));
            console.log("[LocalMessageEditor] Patched getMessage");
          } catch (e) {
            console.error("[LocalMessageEditor] Failed to patch getMessage:", e);
          }
        }

        // Patch getMessages
        if (MessageStore.getMessages) {
          try {
            unpatches.push(after(MessageStore, "getMessages", (args, res) => {
              try {
                if (!res) return res;
                const messages = res._array || res;
                if (Array.isArray(messages)) {
                  const edited = messages.map((msg: any) => {
                    if (msg?.id && hasEdit(msg.id)) {
                      return { ...msg, content: getEdit(msg.id) || msg.content };
                    }
                    return msg;
                  });
                  return res._array ? { ...res, _array: edited } : edited;
                }
              } catch (e) {
                console.error("[LocalMessageEditor] Error in getMessages patch:", e);
              }
              return res;
            }));
            console.log("[LocalMessageEditor] Patched getMessages");
          } catch (e) {
            console.error("[LocalMessageEditor] Failed to patch getMessages:", e);
          }
        }
      }

      // Patch action sheet using Antied pattern
      try {
        const ActionSheet = findByProps("openLazy", "hideActionSheet");
        const ActionSheetRow = findByProps("ActionSheetRow")?.ActionSheetRow;
        
        if (!ActionSheet || !ActionSheet.openLazy) {
          console.error("[LocalMessageEditor] ActionSheet not found");
          showToast("ActionSheet not found", "error");
        } else if (!ActionSheetRow) {
          console.error("[LocalMessageEditor] ActionSheetRow not found");
          showToast("ActionSheetRow not found", "error");
        } else {
          console.log("[LocalMessageEditor] Found ActionSheet and ActionSheetRow");
          
          unpatches.push(before(ActionSheet, "openLazy", ([component, args, actionMessage]) => {
            try {
              const message = actionMessage?.message;
              
              if (args !== "MessageLongPressActionSheet" || !message) return;
              
              console.log("[LocalMessageEditor] Message action sheet opened for:", message.id);
              
              component.then((instance) => {
                const unpatchInstance = after(instance, "default", (_, comp) => {
                  try {
                    React.useEffect(() => () => { unpatchInstance() }, []);
                    
                    // Find the buttons array using the same pattern as Antied
                    const buttons = findInReactTree(comp, c => c?.find?.(a => a?.props?.label?.toLowerCase?.() === 'reply'));
                    
                    if (!buttons) {
                      console.log("[LocalMessageEditor] Buttons array not found");
                      return comp;
                    }
                    
                    console.log("[LocalMessageEditor] Found buttons array, adding edit button");
                    
                    // Find position after Reply button
                    const position = Math.max(
                      buttons.findIndex(a => a?.props?.label?.toLowerCase?.() === 'reply'),
                      buttons.length - 1
                    );
                    
                    const editLabel = hasEdit(message.id) ? "✏️ Edit Locally (modified)" : "📝 Edit Locally";
                    
                    // Add our button using React.createElement (not JSX)
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
                    
                    // If message has been edited, add clear button
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
                    
                    return comp;
                  } catch (e) {
                    console.error("[LocalMessageEditor] Error in action sheet component patch:", e);
                    return comp;
                  }
                });
              });
            } catch (e) {
              console.error("[LocalMessageEditor] Error in action sheet patch:", e);
            }
          }));
          
          console.log("[LocalMessageEditor] ✓ Patched action sheet");
        }
      } catch (e) {
        console.error("[LocalMessageEditor] Failed to patch action sheet:", e);
      }

      console.log("[LocalMessageEditor] === PLUGIN LOADED SUCCESSFULLY ===");
      showToast("LocalMessageEditor loaded! ✅", "success");

    } catch (error) {
      console.error("[LocalMessageEditor] === FATAL ERROR ===");
      console.error("[LocalMessageEditor]", error);
      console.error("[LocalMessageEditor] Stack:", error?.stack);
      try {
        showToast("LocalMessageEditor ERROR - check logs", "error");
      } catch (e) {
        console.error("[LocalMessageEditor] Can't even show toast:", e);
      }
    }
    
    console.log("[LocalMessageEditor] === onLoad() COMPLETED ===");
  },

  onUnload() {
    console.log("[LocalMessageEditor] Unloading...");
    unpatches.forEach((unpatch) => unpatch());
    unpatches.length = 0;
    setModalVisible = null;
    setCurrentMessage = null;
    console.log("[LocalMessageEditor] Unloaded");
  },
  
  // Add Settings panel to keep modal mounted
  Settings: EditModal
};

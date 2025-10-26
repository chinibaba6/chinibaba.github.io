// ============================================================================
// LOCAL MESSAGE EDITOR - REVENGE/VENDETTA PLUGIN
// ============================================================================
// 
// ✅ v2.4.0: Rewritten using UI components patching approach
//
// This plugin allows you to edit Discord messages locally without sending
// changes to the server. Your edits are only visible to you on your device.
//
// ============================================================================

const { storage } = vendetta.plugin;
const { findByProps } = vendetta.metro;
const { after } = vendetta.patcher;
const { showToast } = vendetta.ui.toasts;
const { React, ReactNative } = vendetta.metro.common;

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
    try {
      console.log("[LocalMessageEditor] Loading v2.4.0...");
      showToast("LocalMessageEditor v2.4.0", "info");
      
      initStorage();
      console.log("[LocalMessageEditor] Storage initialized");

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
                  const edited = messages.map((msg) => {
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

      // Use Vendetta's UI components API if available
      try {
        if (vendetta.ui && vendetta.ui.components) {
          showToast("Using Vendetta UI components (not yet implemented)", "info");
          // This would need specific Vendetta UI components implementation
        }
      } catch (e) {
        console.log("[LocalMessageEditor] Vendetta UI components not available");
      }

      console.log("[LocalMessageEditor] ✅ Plugin loaded!");
      console.log("[LocalMessageEditor] NOTE: Context menu not yet working in Revenge");
      console.log("[LocalMessageEditor] Message content patching is active");
      showToast("LocalMessageEditor loaded! (Menu pending)", "success");
      
    } catch (error) {
      console.error("[LocalMessageEditor] Fatal error:", error);
      showToast("Failed to load: " + error.message, "error");
    }
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

// ============================================================================
// LOCAL MESSAGE EDITOR - REVENGE/VENDETTA PLUGIN
// ============================================================================
// 
// ✅ v2.3.0: Complete rewrite following working Revenge plugin patterns
// Compatible with Revenge and Vendetta
//
// This plugin allows you to edit Discord messages locally without sending
// changes to the server. Your edits are only visible to you on your device.
//
// ============================================================================

import { storage } from "@vendetta/plugin";
import { findByProps, findByDisplayName } from "@vendetta/metro";
import { before, after } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";
import { React, ReactNative } from "@vendetta/metro/common";

const { View, Text, TextInput, Pressable, StyleSheet, Modal } = ReactNative;

// Storage helpers
function initStorage() {
  if (!storage.edits) {
    storage.edits = {};
  }
}

function setEdit(messageId: string, content: string) {
  if (!storage.edits) storage.edits = {};
  storage.edits[messageId] = content;
}

function getEdit(messageId: string): string | undefined {
  return storage.edits?.[messageId];
}

function hasEdit(messageId: string): boolean {
  return messageId in (storage.edits || {});
}

function clearEdit(messageId: string) {
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
  actionSheetButton: {
    padding: 16,
    backgroundColor: "#2f3136",
    borderTopWidth: 1,
    borderTopColor: "#202225",
  },
  actionSheetText: {
    color: "#ffffff",
    fontSize: 16,
  },
});

// Modal state
let modalVisible = false;
let setModalVisible: ((visible: boolean) => void) | null = null;
let currentMessage: { id: string; content: string } | null = null;
let setCurrentMessage: ((message: { id: string; content: string } | null) => void) | null = null;

// Modal component
function EditModal() {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState<{ id: string; content: string } | null>(null);
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.container}>
          <Text style={styles.header}>Edit Message Locally</Text>
          <TextInput
            style={styles.input}
            value={newContent}
            onChangeText={setNewContent}
            placeholder="Enter new message content..."
            placeholderTextColor="#72767d"
            multiline
            autoFocus
          />
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={handleClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            {hasEdit(message.id) && (
              <Pressable style={[styles.button, styles.clearButton]} onPress={handleClear}>
                <Text style={styles.buttonText}>Clear</Text>
              </Pressable>
            )}
            <Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Show modal helper
function showEditModal(message: { id: string; content: string }) {
  if (setCurrentMessage && setModalVisible) {
    setCurrentMessage(message);
    setModalVisible(true);
  }
}

// Store unpatches
const unpatches: (() => void)[] = [];

// Main plugin export
export default {
  onLoad() {
    try {
      console.log("[LocalMessageEditor] Loading v2.3.3...");
      
      initStorage();
      console.log("[LocalMessageEditor] Storage initialized");

      // Find MessageStore
      const MessageStore = findByProps("getMessage", "getMessages");
      if (!MessageStore) {
        console.error("[LocalMessageEditor] MessageStore not found");
        showToast("LocalMessageEditor: MessageStore not found", "error");
        // Don't return, let plugin load anyway
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

      // Patch action sheet for context menu
      try {
        const ActionSheet = findByProps("hideActionSheet");
        const MessageContextMenu = findByDisplayName("MessageContextMenu");

        if (ActionSheet && MessageContextMenu) {
          unpatches.push(after(MessageContextMenu, "default", (args, ret) => {
            try {
              const message = args[0]?.message;
              if (!message?.id) return ret;

              const children = ret?.props?.children;
              if (!Array.isArray(children)) return ret;

              // Find menu groups
              const menuGroups = children.filter(child => child?.type?.displayName === "MenuGroup");
              if (menuGroups.length === 0) return ret;

              const lastGroup = menuGroups[menuGroups.length - 1];
              const buttons = lastGroup?.props?.children;
              if (!Array.isArray(buttons)) return ret;

              // Avoid duplicate
              if (buttons.some(b => b?.props?.label?.includes?.("Edit Locally"))) return ret;

              const editLabel = hasEdit(message.id) ? "✏️ Edit Locally (modified)" : "📝 Edit Locally";

              buttons.push(
                React.createElement(
                  "MenuItem",
                  {
                    label: editLabel,
                    icon: "ic_edit_24px",
                    onPress: () => {
                      ActionSheet.hideActionSheet?.();
                      showEditModal(message);
                    },
                  }
                )
              );

              return ret;
            } catch (e) {
              console.error("[LocalMessageEditor] Error in context menu patch:", e);
              return ret;
            }
          }));
          console.log("[LocalMessageEditor] Patched context menu");
        } else {
          console.warn("[LocalMessageEditor] Context menu components not found");
        }
      } catch (e) {
        console.error("[LocalMessageEditor] Failed to patch context menu:", e);
      }

      console.log("[LocalMessageEditor] ✅ Loaded successfully!");
      showToast("LocalMessageEditor loaded ✅", "success");
    } catch (error) {
      console.error("[LocalMessageEditor] Fatal error in onLoad:", error);
      showToast("LocalMessageEditor: Failed to load - check console", "error");
      // Don't throw - let the plugin still load
    }
  },

  onUnload() {
    console.log("[LocalMessageEditor] Unloading...");
    unpatches.forEach((unpatch) => unpatch());
    unpatches.length = 0;
    setModalVisible = null;
    setCurrentMessage = null;
    console.log("[LocalMessageEditor] Unloaded");
  }
};

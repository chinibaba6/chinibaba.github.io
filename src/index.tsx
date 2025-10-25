// ============================================================================
// LOCAL MESSAGE EDITOR - REVENGE/VENDETTA PLUGIN
// ============================================================================
// 
// ✅ v2.2.2: Fixed storage initialization for Revenge 301.8
// Compatible with both Revenge and Vendetta
//
// This plugin allows you to edit Discord messages locally without sending
// changes to the server. Your edits are only visible to you on your device.
//
// ============================================================================

// Standard ES6 imports for Revenge/Vendetta
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { before, after } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";
import { React, ReactNative as RN } from "@vendetta/metro/common";

const { View, Text, TextInput, Pressable, StyleSheet, Modal } = RN;

// Helper functions to manage edits
function initStorage() {
  if (!storage.edits) {
    storage.edits = {};
  }
}

function setEdit(messageId: string, content: string) {
  if (!storage.edits) storage.edits = {};
  storage.edits = {
    ...storage.edits,
    [messageId]: content,
  };
}

function getEdit(messageId: string): string | undefined {
  return storage.edits?.[messageId];
}

function hasEdit(messageId: string): boolean {
  return messageId in (storage.edits || {});
}

function clearEdit(messageId: string) {
  if (!storage.edits) return;
  const newEdits = { ...storage.edits };
  delete newEdits[messageId];
  storage.edits = newEdits;
}

// Move styles outside component to prevent recreation on every render
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
    fontWeight: "bold" as const,
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
    textAlignVertical: "top" as const,
  },
  buttonContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    flex: 1,
    alignItems: "center" as const,
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
    fontWeight: "600" as const,
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

// Modal state - needs to be managed outside component
let modalVisible = false;
let setModalVisible: ((visible: boolean) => void) | null = null;
let currentMessage: { id: string; content: string } | null = null;
let setCurrentMessage: ((message: { id: string; content: string } | null) => void) | null = null;

// Modal component
function EditModal() {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState<{ id: string; content: string } | null>(null);
  const [newContent, setNewContent] = React.useState("");

  // Expose state setters
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
    
    try {
      setEdit(message.id, newContent);
      showToast("Message edited locally", "success");
      setVisible(false);
      setMessage(null);
    } catch (error) {
      console.error("[LocalMessageEditor] Error saving edit:", error);
      showToast("Failed to save edit", "error");
    }
  };

  const handleClear = () => {
    if (!message) return;
    
    try {
      clearEdit(message.id);
      showToast("Edit cleared", "info");
      setVisible(false);
      setMessage(null);
    } catch (error) {
      console.error("[LocalMessageEditor] Error clearing edit:", error);
      showToast("Failed to clear edit", "error");
    }
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

// Helper to show modal
function showEditModal(message: { id: string; content: string }) {
  if (setCurrentMessage && setModalVisible) {
    setCurrentMessage(message);
    setModalVisible(true);
  } else {
    console.warn("[LocalMessageEditor] Modal not ready");
    showToast("Please wait, modal is loading", "warning");
  }
}

// Store unpatch functions
const unpatches: (() => void)[] = [];

// Store modal instance
let ModalInstance: any = null;

// Plugin entry point
export default {
  onLoad() {
    console.log("[LocalMessageEditor] Loading plugin v2.2.2 for Revenge 301.8...");

    try {
      // Initialize storage first
      initStorage();
      console.log("[LocalMessageEditor] ✓ Storage initialized");

      // Create modal instance
      const modalRoot = React.createElement(EditModal);
      ModalInstance = modalRoot;
      console.log("[LocalMessageEditor] ✓ Modal instance created");

      // Find Discord modules
      const MessageStore = findByProps("getMessage", "getMessages");
      
      if (!MessageStore) {
        console.error("[LocalMessageEditor] ❌ MessageStore not found!");
        showToast("LocalMessageEditor: MessageStore not found", "error");
        return;
      }

      console.log("[LocalMessageEditor] ✓ MessageStore found");

      // Patch getMessage to inject edited content
      if (MessageStore.getMessage) {
        const unpatch = after(MessageStore, "getMessage", (args, res) => {
          if (!res) return res;
          
          try {
            if (res.id && hasEdit(res.id)) {
              return {
                ...res,
                content: getEdit(res.id) || res.content,
              };
            }
          } catch (error) {
            console.error("[LocalMessageEditor] Error in getMessage patch:", error);
          }
          
          return res;
        });
        unpatches.push(unpatch);
        console.log("[LocalMessageEditor] ✓ Patched getMessage");
      }

      // Patch getMessages to inject edited content for message lists
      if (MessageStore.getMessages) {
        const unpatch = after(MessageStore, "getMessages", (args, res) => {
          if (!res) return res;

          try {
            // Handle different possible return formats
            const messages = res._array || res;
            
            if (Array.isArray(messages)) {
              const edited = messages.map((msg: any) => {
                if (msg?.id && hasEdit(msg.id)) {
                  return {
                    ...msg,
                    content: getEdit(msg.id) || msg.content,
                  };
                }
                return msg;
              });

              // Preserve original structure
              if (res._array) {
                return { ...res, _array: edited };
              }
              return edited;
            }
          } catch (error) {
            console.error("[LocalMessageEditor] Error in getMessages patch:", error);
          }

          return res;
        });
        unpatches.push(unpatch);
        console.log("[LocalMessageEditor] ✓ Patched getMessages");
      }

      // Try to find and patch context menu
      const LazyActionSheet = findByProps("openLazy", "hideActionSheet");
      
      if (LazyActionSheet?.openLazy) {
        const unpatch = before(LazyActionSheet, "openLazy", (args) => {
          try {
            const [component, key, props] = args;

            // Check if this is a message context menu
            if (props?.message?.id && props?.message?.content) {
              const originalComponent = component;
              
              // Wrap the component to add our button
              args[0] = () => {
                try {
                  const OriginalSheet = typeof originalComponent === "function" 
                    ? originalComponent() 
                    : originalComponent;
                  
                  return React.createElement(
                    React.Fragment,
                    null,
                    OriginalSheet,
                    React.createElement(
                      Pressable,
                      {
                        style: styles.actionSheetButton,
                        onPress: () => {
                          try {
                            if (LazyActionSheet.hideActionSheet) {
                              LazyActionSheet.hideActionSheet();
                            }
                            
                            // Show edit modal
                            showEditModal(props.message);
                          } catch (error) {
                            console.error("[LocalMessageEditor] Error showing modal:", error);
                            showToast("Failed to open editor", "error");
                          }
                        },
                      },
                      React.createElement(
                        Text,
                        { style: styles.actionSheetText },
                        hasEdit(props.message.id) ? "✏️ Edit Locally (modified)" : "📝 Edit Locally"
                      )
                    )
                  );
                } catch (error) {
                  console.error("[LocalMessageEditor] Error wrapping action sheet:", error);
                  return typeof originalComponent === "function" ? originalComponent() : originalComponent;
                }
              };
            }
          } catch (error) {
            console.error("[LocalMessageEditor] Error in action sheet patch:", error);
          }
        });
        unpatches.push(unpatch);
        console.log("[LocalMessageEditor] ✓ Patched action sheet");
      } else {
        console.warn("[LocalMessageEditor] ⚠️ Action sheet not found - context menu won't work");
      }

      console.log("[LocalMessageEditor] Plugin loaded successfully!");
      showToast("LocalMessageEditor loaded", "success");

    } catch (error) {
      console.error("[LocalMessageEditor] Failed to load:", error);
      showToast("LocalMessageEditor: Error loading plugin", "error");
    }
  },

  onUnload() {
    console.log("[LocalMessageEditor] Unloading plugin...");

    try {
      // Unpatch all modifications
      unpatches.forEach((unpatch) => {
        try {
          unpatch();
        } catch (error) {
          console.error("[LocalMessageEditor] Error unpatching:", error);
        }
      });
      unpatches.length = 0;

      // Clear modal references
      setModalVisible = null;
      setCurrentMessage = null;
      ModalInstance = null;

      console.log("[LocalMessageEditor] Plugin unloaded!");
    } catch (error) {
      console.error("[LocalMessageEditor] Error during unload:", error);
    }
  },

  // Settings UI renders the modal
  settings: EditModal,
};

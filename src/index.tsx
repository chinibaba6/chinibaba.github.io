// ============================================================================
// LOCAL MESSAGE EDITOR - REVENGE/VENDETTA PLUGIN
// ============================================================================
// 
// ✅ v3.1.0: Hybrid approach - Settings page + action sheet patching
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

const { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Modal } = ReactNative;

// Find modules
const ActionSheet = findByProps("openLazy", "hideActionSheet");
const MessageStore = findByProps("getMessage", "getMessages");
const ChannelStore = findByProps("getChannel", "getDMFromUserId");
const ActionSheetRowModule = findByProps("ActionSheetRow");
const ActionSheetRow = ActionSheetRowModule?.ActionSheetRow;

// Storage helpers
function initStorage() {
  if (!storage.edits) {
    storage.edits = {};
  }
  if (!storage.messageIdInput) {
    storage.messageIdInput = "";
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
  settingsContainer: {
    padding: 16,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: "#b9bbbe",
    marginBottom: 12,
  },
  smallInput: {
    backgroundColor: "#40444b",
    color: "#dcddde",
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  editList: {
    marginTop: 16,
  },
  editItem: {
    backgroundColor: "#40444b",
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  editItemId: {
    color: "#7289da",
    fontSize: 12,
    marginBottom: 4,
  },
  editItemContent: {
    color: "#dcddde",
    fontSize: 14,
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
    
    FluxDispatcher.dispatch({
      type: "MESSAGE_UPDATE",
      message: {
        ...message,
        content: newContent,
      },
    });
    
    showToast("Message edited locally ✅", "success");
    setVisible(false);
    setMessage(null);
  };

  const handleClear = () => {
    if (!message) return;
    clearEdit(message.id);
    
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

// Settings Page Component
function SettingsPage() {
  const [messageId, setMessageId] = React.useState("");
  const [channelId, setChannelId] = React.useState("");
  const [refresh, setRefresh] = React.useState(0);

  const handleEditMessage = () => {
    if (!messageId.trim()) {
      showToast("Please enter a message ID", "error");
      return;
    }

    let message = null;
    
    // Try to find message
    if (channelId.trim()) {
      message = MessageStore.getMessage(channelId, messageId);
    } else {
      // Search all channels
      const channels = Object.keys(MessageStore._channelMessages || {});
      for (const chId of channels) {
        const msg = MessageStore.getMessage(chId, messageId);
        if (msg) {
          message = msg;
          break;
        }
      }
    }

    if (!message) {
      showToast("Message not found! Try adding Channel ID", "error");
      return;
    }

    if (setCurrentMessage && setModalVisible) {
      setCurrentMessage(message);
      setModalVisible(true);
    }
  };

  const handleClearEdit = (msgId) => {
    clearEdit(msgId);
    showToast("Edit cleared", "info");
    setRefresh(r => r + 1);
  };

  const editedMessages = Object.keys(storage.edits || {});

  return React.createElement(
    ScrollView,
    { style: styles.settingsContainer },
    
    React.createElement(Text, { style: styles.settingsTitle }, "Local Message Editor"),
    
    React.createElement(
      View,
      { style: styles.settingsSection },
      React.createElement(Text, { style: styles.sectionTitle }, "📝 Edit a Message"),
      React.createElement(Text, { style: styles.sectionDesc }, 
        "Method 1: Long-press a message and select 'Edit Locally' (if action sheet works)\n\n" +
        "Method 2: Enter message ID below (copy from message link or 'Copy ID')"
      ),
      React.createElement(TextInput, {
        style: styles.smallInput,
        value: messageId,
        onChangeText: setMessageId,
        placeholder: "Message ID (required)",
        placeholderTextColor: "#72767d",
      }),
      React.createElement(TextInput, {
        style: styles.smallInput,
        value: channelId,
        onChangeText: setChannelId,
        placeholder: "Channel ID (optional, helps find message)",
        placeholderTextColor: "#72767d",
      }),
      React.createElement(
        Pressable,
        { 
          style: [styles.button, styles.saveButton, { marginTop: 8 }],
          onPress: handleEditMessage
        },
        React.createElement(Text, { style: styles.buttonText }, "Edit Message")
      )
    ),
    
    React.createElement(
      View,
      { style: styles.settingsSection },
      React.createElement(Text, { style: styles.sectionTitle }, 
        `✏️ Currently Edited Messages (${editedMessages.length})`
      ),
      React.createElement(Text, { style: styles.sectionDesc }, 
        "Messages you've edited locally. Tap to clear an edit."
      ),
      editedMessages.length === 0 
        ? React.createElement(Text, { style: { color: "#72767d", fontStyle: "italic" } }, 
            "No edited messages yet")
        : React.createElement(
            View,
            { style: styles.editList },
            ...editedMessages.map((msgId) => 
              React.createElement(
                Pressable,
                {
                  key: msgId,
                  style: styles.editItem,
                  onPress: () => handleClearEdit(msgId)
                },
                React.createElement(Text, { style: styles.editItemId }, `ID: ${msgId}`),
                React.createElement(Text, { 
                  style: styles.editItemContent,
                  numberOfLines: 2
                }, storage.edits[msgId])
              )
            )
          )
    ),
    
    React.createElement(
      View,
      { style: styles.settingsSection },
      React.createElement(Text, { style: styles.sectionTitle }, "ℹ️ How to Get Message/Channel ID"),
      React.createElement(Text, { style: styles.sectionDesc }, 
        "1. Enable Developer Mode in Discord settings\n" +
        "2. Long-press a message\n" +
        "3. Tap 'Copy ID' or 'Copy Message Link'\n" +
        "4. Paste the ID above"
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

// Action sheet patch
function patchActionSheet() {
  if (!ActionSheet || !ActionSheet.openLazy) {
    console.log("[LocalMessageEditor] ActionSheet.openLazy not available");
    return null;
  }
  
  if (!ActionSheetRow) {
    console.log("[LocalMessageEditor] ActionSheetRow not available");
    return null;
  }

  console.log("[LocalMessageEditor] Attempting action sheet patch...");

  return before("openLazy", ActionSheet, ([component, args, actionMessage]) => {
    try {
      const message = actionMessage?.message;
      
      if (args !== "MessageLongPressActionSheet" || !message) return;
      
      console.log("[LocalMessageEditor] ✓ Intercepted message menu:", message.id);
      
      component.then((instance) => {
        const unpatch = after("default", instance, (_, comp) => {
          try {
            React.useEffect(() => () => { unpatch() }, []);
            
            const buttons = findInReactTree(comp, c => c?.find?.(a => a?.props?.label?.toLowerCase?.() == 'reply'));
            
            if (!buttons) {
              console.log("[LocalMessageEditor] Buttons array not found");
              return comp;
            }
            
            const position = Math.max(
              buttons.findIndex(a => a?.props?.label?.toLowerCase?.() == 'reply'),
              buttons.length - 1
            );
            
            const editLabel = hasEdit(message.id) ? "Edit Locally ✏️" : "Edit Locally 📝";
            
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
            
            console.log("[LocalMessageEditor] ✓ Added button to action sheet");
            return comp;
            
          } catch (e) {
            console.error("[LocalMessageEditor] Error in component patch:", e);
            return comp;
          }
        });
      });
      
    } catch (e) {
      console.error("[LocalMessageEditor] Error in openLazy:", e);
    }
  });
}

// Main plugin export
module.exports = {
  onLoad() {
    console.log("[LocalMessageEditor] ========================================");
    console.log("[LocalMessageEditor] Loading v3.1.0 (Hybrid Solution)...");
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
    setModalVisible = null;
    setCurrentMessage = null;
    console.log("[LocalMessageEditor] Unloaded");
  },
  
  Settings: SettingsPage
};

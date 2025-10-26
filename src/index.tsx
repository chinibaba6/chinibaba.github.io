// ============================================================================
// LOCAL MESSAGE EDITOR - REVENGE/VENDETTA PLUGIN
// ============================================================================
// v3.5.0: Simplified single-file approach for maximum compatibility
// ============================================================================

const { storage } = vendetta.plugin;
const { findByProps, findByStoreName } = vendetta.metro;
const { before, after } = vendetta.patcher;
const { showToast } = vendetta.ui.toasts;
const { React, ReactNative, FluxDispatcher, i18n } = vendetta.metro.common;
const { getAssetIDByName } = vendetta.ui.assets;
const { semanticColors } = vendetta.ui;
const { findInReactTree } = vendetta.utils;

const { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Modal, Image } = ReactNative;

// Find modules
const LazyActionSheet = findByProps("openLazy", "hideActionSheet");
const MessageStore = findByStoreName("MessageStore");
const ActionSheetRowModule = findByProps("ActionSheetRow");
const ActionSheetRow = ActionSheetRowModule?.ActionSheetRow;

console.log("[LocalMessageEditor] 🚀 Plugin file loaded!");

// ============================================================================
// STORAGE
// ============================================================================

function initStorage() {
  if (!storage.edits) storage.edits = {};
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

// ============================================================================
// STYLES
// ============================================================================

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

const iconStyles = StyleSheet.create({
  iconComponent: {
    width: 24,
    height: 24,
    tintColor: semanticColors?.INTERACTIVE_NORMAL || "#b9bbbe"
  }
});

// ============================================================================
// MODAL STATE
// ============================================================================

let setModalVisible = null;
let setCurrentMessage = null;

function showEditModal(message) {
  console.log("[LocalMessageEditor] showEditModal called for:", message?.id);
  if (setCurrentMessage && setModalVisible) {
    setCurrentMessage(message);
    setModalVisible(true);
  } else {
    console.error("[LocalMessageEditor] Modal not ready!");
    showToast("Modal not ready, try again", "error");
  }
}

// ============================================================================
// EDIT MODAL COMPONENT
// ============================================================================

function EditModal() {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [newContent, setNewContent] = React.useState("");

  React.useEffect(() => {
    console.log("[LocalMessageEditor] EditModal mounted");
    setModalVisible = setVisible;
    setCurrentMessage = (msg) => {
      console.log("[LocalMessageEditor] Setting current message:", msg?.id);
      setMessage(msg);
      if (msg) {
        setNewContent(getEdit(msg.id) || msg.content);
      }
    };
    
    return () => {
      console.log("[LocalMessageEditor] EditModal unmounted");
      setModalVisible = null;
      setCurrentMessage = null;
    };
  }, []);

  const handleSave = () => {
    if (!message) return;
    console.log("[LocalMessageEditor] Saving edit for:", message.id);
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
    console.log("[LocalMessageEditor] Clearing edit for:", message.id);
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
    console.log("[LocalMessageEditor] Closing modal");
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

// ============================================================================
// SETTINGS PAGE COMPONENT
// ============================================================================

function SettingsPage() {
  const [messageId, setMessageId] = React.useState("");
  const [channelId, setChannelId] = React.useState("");
  const [refresh, setRefresh] = React.useState(0);

  const handleEditMessage = () => {
    console.log("[LocalMessageEditor] Settings: Edit button pressed");
    console.log("  - messageId:", messageId);
    console.log("  - channelId:", channelId);
    
    if (!messageId.trim()) {
      showToast("Please enter a message ID", "error");
      return;
    }

    let message = null;
    
    if (channelId.trim()) {
      message = MessageStore.getMessage(channelId, messageId);
      console.log("  - Found in channel:", !!message);
    } else {
      const channels = Object.keys(MessageStore._channelMessages || {});
      console.log("  - Searching", channels.length, "channels...");
      for (const chId of channels) {
        const msg = MessageStore.getMessage(chId, messageId);
        if (msg) {
          message = msg;
          console.log("  - Found in channel:", chId);
          break;
        }
      }
    }

    if (!message) {
      console.error("  - Message NOT found!");
      showToast("Message not found! Try adding Channel ID", "error");
      return;
    }

    console.log("  - Message found! Opening modal...");
    showEditModal(message);
  };

  const handleClearEdit = (msgId) => {
    console.log("[LocalMessageEditor] Clearing edit:", msgId);
    clearEdit(msgId);
    showToast("Edit cleared", "info");
    setRefresh(r => r + 1);
  };

  const editedMessages = Object.keys(storage.edits || {});

  return React.createElement(
    ScrollView,
    { style: styles.settingsContainer },
    
    React.createElement(EditModal),
    
    React.createElement(Text, { style: styles.settingsTitle }, "Local Message Editor"),
    
    React.createElement(
      View,
      { style: styles.settingsSection },
      React.createElement(Text, { style: styles.sectionTitle }, "📝 Edit a Message"),
      React.createElement(Text, { style: styles.sectionDesc }, 
        "Enter message ID below to edit any message locally"
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

// ============================================================================
// ACTION SHEET PATCH (dislate pattern)
// ============================================================================

function patchActionSheet() {
  console.log("[LocalMessageEditor] 🔍 Checking action sheet modules...");
  console.log("  - LazyActionSheet:", !!LazyActionSheet);
  console.log("  - LazyActionSheet.openLazy:", !!LazyActionSheet?.openLazy);
  console.log("  - ActionSheetRow:", !!ActionSheetRow);
  console.log("  - MessageStore:", !!MessageStore);
  console.log("  - i18n.Messages:", !!i18n?.Messages);
  
  if (!LazyActionSheet || !LazyActionSheet.openLazy || !ActionSheetRow) {
    console.error("[LocalMessageEditor] ❌ Required modules missing!");
    return null;
  }

  console.log("[LocalMessageEditor] ✅ Patching action sheet...");

  return before("openLazy", LazyActionSheet, ([component, key, msg]) => {
    const message = msg?.message;
    
    if (key !== "MessageLongPressActionSheet" || !message) return;
    
    console.log("[LocalMessageEditor] 📋 Long-press detected:", message.id);
    
    component.then((instance) => {
      const unpatch = after("default", instance, (_, component) => {
        try {
          React.useEffect(() => () => { unpatch() }, []);
          
          console.log("[LocalMessageEditor] 🔍 Finding buttons...");
          
          // dislate pattern
          const buttons = findInReactTree(component, x => x?.[0]?.type?.name === "ActionSheetRow");
          
          if (!buttons) {
            console.error("[LocalMessageEditor] ❌ Buttons not found!");
            return component;
          }
          
          console.log("[LocalMessageEditor] ✅ Found", buttons.length, "buttons");
          
          const markUnreadIndex = buttons.findIndex((x) => x?.props?.message === i18n?.Messages?.MARK_UNREAD);
          const position = Math.max(markUnreadIndex, 0);
          
          console.log("[LocalMessageEditor] 📍 Inserting at position:", position);
          
          const originalMessage = MessageStore.getMessage(message.channel_id, message.id);
          if (!originalMessage?.content && !message.content) {
            console.log("[LocalMessageEditor] ⚠️ No message content");
            return component;
          }
          
          const editLabel = hasEdit(message.id) ? "Edit Locally ✏️" : "Edit Locally";
          const icon = getAssetIDByName("ic_edit_24px");
          
          const editButton = React.createElement(ActionSheetRow, {
            label: editLabel,
            icon: React.createElement(ActionSheetRow.Icon, {
              source: icon,
              IconComponent: () => React.createElement(Image, {
                resizeMode: "cover",
                style: iconStyles.iconComponent,
                source: icon
              })
            }),
            onPress: () => {
              console.log("[LocalMessageEditor] 🖱️ Button pressed!");
              LazyActionSheet.hideActionSheet();
              showEditModal(originalMessage || message);
            }
          });
          
          buttons.splice(position, 0, editButton);
          
          console.log("[LocalMessageEditor] ✅✅✅ Button added!");
          return component;
          
        } catch (e) {
          console.error("[LocalMessageEditor] ❌ Error:", e);
          return component;
        }
      });
    });
  });
}

// ============================================================================
// MAIN PLUGIN EXPORT
// ============================================================================

const unpatches = [];

module.exports = {
  onLoad() {
    console.log("========================================");
    console.log("[LocalMessageEditor] 🚀 LOADING v3.5.0");
    console.log("========================================");
    
    try {
      initStorage();
      console.log("[LocalMessageEditor] ✓ Storage initialized");
      
      if (!MessageStore) {
        throw new Error("MessageStore not found!");
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

      // Apply action sheet patch
      const actionSheetPatch = patchActionSheet();
      if (actionSheetPatch) {
        unpatches.push(actionSheetPatch);
        console.log("[LocalMessageEditor] ✓ Action sheet patched");
      } else {
        console.log("[LocalMessageEditor] ⚠️ Action sheet patch failed");
      }

      console.log("========================================");
      console.log("[LocalMessageEditor] ✅ LOADED!");
      console.log("[LocalMessageEditor] 📱 Open Settings to edit messages");
      console.log("========================================");
      showToast("Local Message Editor loaded!", "success");
      
    } catch (error) {
      console.error("[LocalMessageEditor] ❌ LOAD ERROR:", error);
      console.error(error.stack);
      showToast("Plugin load error: " + error.message, "error");
    }
  },

  onUnload() {
    console.log("[LocalMessageEditor] Unloading...");
    unpatches.forEach((u) => { try { u() } catch(e) { console.error(e) } });
    unpatches.length = 0;
    setModalVisible = null;
    setCurrentMessage = null;
    console.log("[LocalMessageEditor] ✅ Unloaded");
  },
  
  Settings: SettingsPage
};

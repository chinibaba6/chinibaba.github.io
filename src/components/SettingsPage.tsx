// ============================================================================
// Settings Page Component - Local Message Editor
// ============================================================================

const { findByStoreName } = vendetta.metro;
const { React, ReactNative } = vendetta.metro.common;
const { showToast } = vendetta.ui.toasts;

const { View, Text, TextInput, Pressable, ScrollView } = ReactNative;

// Import helpers
const storageModule = require("../storage");
const { storage, clearEdit } = storageModule;

const stylesModule = require("../styles");
const { styles } = stylesModule;

const utilsModule = require("../utils");
const { setModalVisible, setCurrentMessage } = utilsModule;

// Find stores
const MessageStore = findByStoreName("MessageStore");

export default function SettingsPage() {
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
        "Method 1: Long-press a message → 'Edit Locally' (if available)\n\n" +
        "Method 2: Enter message ID below (always works)\n\n" +
        "Method 3: Use /edit command if supported by your client"
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


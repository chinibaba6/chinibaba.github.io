// ============================================================================
// Edit Modal Component - Local Message Editor
// ============================================================================

const { React, ReactNative, FluxDispatcher } = vendetta.metro.common;
const { showToast } = vendetta.ui.toasts;

const { View, Text, TextInput, Pressable, StyleSheet, Modal } = ReactNative;

// Import helpers
const storageModule = require("../storage");
const { setEdit, getEdit, hasEdit, clearEdit } = storageModule;

const stylesModule = require("../styles");
const { styles } = stylesModule;

const utilsModule = require("../utils");
const { registerModalState, unregisterModalState } = utilsModule;

export default function EditModal() {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [newContent, setNewContent] = React.useState("");

  React.useEffect(() => {
    registerModalState(setVisible, (msg) => {
      setMessage(msg);
      if (msg) {
        setNewContent(getEdit(msg.id) || msg.content);
      }
    });
    
    return () => {
      unregisterModalState();
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


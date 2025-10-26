// ============================================================================
// Action Sheet Patch - Local Message Editor
// ============================================================================
// Following the dislate plugin pattern
// ============================================================================

const { findByProps, findByStoreName } = vendetta.metro;
const { before, after } = vendetta.patcher;
const { React, ReactNative, i18n } = vendetta.metro.common;
const { getAssetIDByName } = vendetta.ui.assets;
const { findInReactTree } = vendetta.utils;

const { Image } = ReactNative;

// Import helpers
const storageModule = require("../storage");
const { hasEdit } = storageModule;

const stylesModule = require("../styles");
const { iconStyles } = stylesModule;

const utilsModule = require("../utils");
const { showEditModal } = utilsModule;

// Find modules
const LazyActionSheet = findByProps("openLazy", "hideActionSheet");
const MessageStore = findByStoreName("MessageStore");
const ActionSheetRowModule = findByProps("ActionSheetRow");
const ActionSheetRow = ActionSheetRowModule?.ActionSheetRow;

export default function patchActionSheet() {
  // Enhanced module detection
  console.log("[LocalMessageEditor] 🔍 Module Detection:");
  console.log("  - LazyActionSheet:", !!LazyActionSheet);
  console.log("  - LazyActionSheet.openLazy:", !!LazyActionSheet?.openLazy);
  console.log("  - MessageStore:", !!MessageStore);
  console.log("  - ActionSheetRowModule:", !!ActionSheetRowModule);
  console.log("  - ActionSheetRow:", !!ActionSheetRow);
  console.log("  - i18n:", !!i18n);
  console.log("  - i18n.Messages:", !!i18n?.Messages);
  console.log("  - i18n.Messages.MARK_UNREAD:", i18n?.Messages?.MARK_UNREAD);
  
  if (!LazyActionSheet || !LazyActionSheet.openLazy) {
    console.error("[LocalMessageEditor] ❌ LazyActionSheet.openLazy not available");
    return null;
  }
  
  if (!ActionSheetRow) {
    console.error("[LocalMessageEditor] ❌ ActionSheetRow not available");
    return null;
  }

  console.log("[LocalMessageEditor] ✅ All modules found! Applying patch...");

  return before("openLazy", LazyActionSheet, ([component, key, msg]) => {
    try {
      const message = msg?.message;
      
      console.log("[LocalMessageEditor] 📥 openLazy called:");
      console.log("  - key:", key);
      console.log("  - has message:", !!message);
      console.log("  - message.id:", message?.id);
      
      if (key !== "MessageLongPressActionSheet") {
        console.log("[LocalMessageEditor] ⏭️ Skipping (not MessageLongPressActionSheet)");
        return;
      }
      
      if (!message) {
        console.log("[LocalMessageEditor] ⏭️ Skipping (no message)");
        return;
      }
      
      console.log("[LocalMessageEditor] ✅ Intercepted message menu for:", message.id);
      
      component.then((instance) => {
        console.log("[LocalMessageEditor] 📦 Component loaded, applying after patch...");
        console.log("  - instance:", !!instance);
        console.log("  - instance.default:", !!instance?.default);
        
        const unpatch = after("default", instance, (_, component) => {
          try {
            React.useEffect(() => () => { unpatch() }, []);
            
            console.log("[LocalMessageEditor] 🔍 Searching for buttons array...");
            
            // Use dislate's button detection pattern
            const buttons = findInReactTree(component, x => x?.[0]?.type?.name === "ActionSheetRow");
            
            if (!buttons) {
              console.error("[LocalMessageEditor] ❌ Buttons array not found!");
              console.log("  - Trying alternative search patterns...");
              
              // Try alternative patterns
              const alt1 = findInReactTree(component, x => Array.isArray(x) && x.length > 0);
              console.log("  - Found arrays:", !!alt1);
              
              return component;
            }
            
            console.log("[LocalMessageEditor] ✅ Found buttons array!");
            console.log("  - buttons.length:", buttons.length);
            console.log("  - First button label:", buttons[0]?.props?.label);
            
            // Use dislate's position logic
            const markUnreadIndex = buttons.findIndex((x) => x?.props?.message === i18n?.Messages?.MARK_UNREAD);
            console.log("  - MARK_UNREAD index:", markUnreadIndex);
            
            const position = Math.max(markUnreadIndex, 0);
            console.log("  - Insert position:", position);
            
            const originalMessage = MessageStore.getMessage(message.channel_id, message.id);
            console.log("  - Original message found:", !!originalMessage);
            
            if (!originalMessage?.content && !message.content) {
              console.error("[LocalMessageEditor] ❌ No message content!");
              return component;
            }
            
            const editLabel = hasEdit(message.id) ? "Edit Locally ✏️" : "Edit Locally";
            const icon = getAssetIDByName("ic_edit_24px");
            console.log("  - Icon ID:", icon);
            console.log("  - Label:", editLabel);
            
            // Create button using React.createElement (dislate uses JSX but we avoid it)
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
                console.log("[LocalMessageEditor] 🖱️ Edit button pressed!");
                LazyActionSheet.hideActionSheet();
                showEditModal(originalMessage || message);
              }
            });
            
            console.log("  - Button created:", !!editButton);
            buttons.splice(position, 0, editButton);
            console.log("  - Button inserted at position", position);
            
            console.log("[LocalMessageEditor] ✅✅✅ 'Edit Locally' button added!");
            return component;
            
          } catch (e) {
            console.error("[LocalMessageEditor] ❌ Error in component patch:");
            console.error(e);
            console.error("Stack:", e.stack);
            return component;
          }
        });
        
        console.log("[LocalMessageEditor] ✅ After patch applied");
      }).catch((e) => {
        console.error("[LocalMessageEditor] ❌ Component promise rejected:");
        console.error(e);
      });
      
    } catch (e) {
      console.error("[LocalMessageEditor] ❌ Error in openLazy:");
      console.error(e);
      console.error("Stack:", e.stack);
    }
  });
}


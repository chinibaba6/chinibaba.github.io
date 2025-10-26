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
  if (!LazyActionSheet || !LazyActionSheet.openLazy) {
    console.log("[LocalMessageEditor] LazyActionSheet.openLazy not available");
    return null;
  }
  
  if (!ActionSheetRow) {
    console.log("[LocalMessageEditor] ActionSheetRow not available");
    return null;
  }

  console.log("[LocalMessageEditor] Attempting action sheet patch (dislate pattern)...");

  return before("openLazy", LazyActionSheet, ([component, key, msg]) => {
    try {
      const message = msg?.message;
      
      if (key !== "MessageLongPressActionSheet" || !message) return;
      
      console.log("[LocalMessageEditor] ✓ Intercepted message menu for:", message.id);
      
      component.then((instance) => {
        const unpatch = after("default", instance, (_, component) => {
          try {
            React.useEffect(() => () => { unpatch() }, []);
            
            // Use dislate's button detection pattern
            const buttons = findInReactTree(component, x => x?.[0]?.type?.name === "ActionSheetRow");
            
            if (!buttons) {
              console.log("[LocalMessageEditor] Buttons array not found (dislate pattern)");
              return component;
            }
            
            console.log("[LocalMessageEditor] ✓ Found buttons array with", buttons.length, "items");
            
            // Use dislate's position logic
            const position = Math.max(
              buttons.findIndex((x) => x?.props?.message === i18n?.Messages?.MARK_UNREAD),
              0
            );
            
            console.log("[LocalMessageEditor] Insert position:", position);
            
            const originalMessage = MessageStore.getMessage(message.channel_id, message.id);
            if (!originalMessage?.content && !message.content) {
              console.log("[LocalMessageEditor] No message content found");
              return component;
            }
            
            const editLabel = hasEdit(message.id) ? "Edit Locally ✏️" : "Edit Locally";
            const icon = getAssetIDByName("ic_edit_24px");
            
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
                LazyActionSheet.hideActionSheet();
                showEditModal(originalMessage || message);
              }
            });
            
            buttons.splice(position, 0, editButton);
            
            console.log("[LocalMessageEditor] ✅ Added 'Edit Locally' button to action sheet!");
            return component;
            
          } catch (e) {
            console.error("[LocalMessageEditor] Error in component patch:", e);
            return component;
          }
        });
      });
      
    } catch (e) {
      console.error("[LocalMessageEditor] Error in openLazy:", e);
    }
  });
}


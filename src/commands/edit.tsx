// ============================================================================
// Slash Command - /edit - Local Message Editor
// ============================================================================

const { findByProps, findByStoreName } = vendetta.metro;
const { showToast } = vendetta.ui.toasts;

// Import helpers
const utilsModule = require("../utils");
const { showEditModal } = utilsModule;

// Find modules
const MessageStore = findByStoreName("MessageStore");
const ClydeUtils = findByProps("sendBotMessage");

function registerEditCommand() {
  try {
    console.log("[LocalMessageEditor] 🔍 Checking command registration...");
    console.log("  - vendetta.commands:", !!vendetta.commands);
    console.log("  - vendetta.commands.registerCommand:", !!vendetta.commands?.registerCommand);
    
    if (!vendetta.commands || !vendetta.commands.registerCommand) {
      console.error("[LocalMessageEditor] ❌ Commands API not available!");
      console.log("  - This Revenge version might not support slash commands");
      return null;
    }
    
    const { registerCommand } = vendetta.commands;
    
    console.log("[LocalMessageEditor] ✅ Commands API found, registering /edit...");
    
    const unregister = registerCommand({
      name: "edit",
      displayName: "edit",
      description: "Edit a message locally (only visible to you)",
      displayDescription: "Edit a message locally (only visible to you)",
      applicationId: "-1",
      type: 1, // ApplicationCommandType.CHAT
      inputType: 1, // ApplicationCommandInputType.BUILT_IN
      options: [
        {
          name: "message_id",
          displayName: "message_id",
          description: "The ID of the message to edit (enable Developer Mode and use 'Copy ID')",
          displayDescription: "The ID of the message to edit (enable Developer Mode and use 'Copy ID')",
          type: 3, // ApplicationCommandOptionType.STRING
          required: true
        },
        {
          name: "channel_id",
          displayName: "channel_id",
          description: "The channel ID (optional, leave blank to search all channels)",
          displayDescription: "The channel ID (optional, leave blank to search all channels)",
          type: 3, // ApplicationCommandOptionType.STRING
          required: false
        }
      ],
      async execute(args, ctx) {
        try {
          const messageIdArg = args.find(arg => arg.name === "message_id");
          const channelIdArg = args.find(arg => arg.name === "channel_id");
          
          const messageId = messageIdArg?.value;
          const channelId = channelIdArg?.value || ctx.channel.id;
          
          if (!messageId) {
            showToast("Please provide a message ID", "error");
            return;
          }
          
          console.log("[LocalMessageEditor] /edit command:");
          console.log("  - message_id:", messageId);
          console.log("  - channel_id:", channelId);
          
          let message = null;
          
          // Try to find message
          if (channelId) {
            message = MessageStore.getMessage(channelId, messageId);
            console.log("  - Found in specified channel:", !!message);
          }
          
          // If not found, search all channels
          if (!message) {
            console.log("  - Searching all channels...");
            const channels = Object.keys(MessageStore._channelMessages || {});
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
            showToast("Message not found! Make sure the ID is correct", "error");
            
            if (ClydeUtils?.sendBotMessage) {
              ClydeUtils.sendBotMessage(
                ctx.channel.id,
                "❌ Message not found!\n\n" +
                "**How to get message ID:**\n" +
                "1. Enable Developer Mode in Discord settings\n" +
                "2. Long-press a message\n" +
                "3. Tap 'Copy ID' or 'Copy Message Link'\n" +
                "4. Use that ID in the command"
              );
            }
            return;
          }
          
          console.log("  - Message found! Content:", message.content?.substring(0, 50) + "...");
          
          // Show edit modal
          showEditModal(message);
          showToast("Opening editor...", "success");
          
        } catch (e) {
          console.error("[LocalMessageEditor] /edit command error:", e);
          showToast("Error: " + e.message, "error");
          
          if (ClydeUtils?.sendBotMessage) {
            ClydeUtils.sendBotMessage(
              ctx.channel.id,
              "❌ Failed to edit message. Check console for details."
            );
          }
        }
      }
    });
    
    console.log("[LocalMessageEditor] ✅ /edit command registered");
    return unregister;
    
  } catch (e) {
    console.error("[LocalMessageEditor] ❌ Failed to register /edit command:", e);
    console.error("  Stack:", e.stack);
    showToast("Commands not supported in this version", "error");
    return null;
  }
}

module.exports = { default: registerEditCommand };


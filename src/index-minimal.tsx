// Absolute minimal plugin - if this doesn't work, nothing will
import { showToast } from "@vendetta/ui/toasts";

export default {
  onLoad: () => {
    console.log("✅ MINIMAL PLUGIN LOADED!");
    showToast("Minimal Plugin Loaded!", "success");
  },
  onUnload: () => {
    console.log("❌ MINIMAL PLUGIN UNLOADED");
    showToast("Minimal Plugin Unloaded!", "info");
  }
};


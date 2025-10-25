// Minimal test plugin for Revenge 301.8
import { showToast } from "@vendetta/ui/toasts";

export default {
  onLoad() {
    console.log("[TEST] Plugin loading...");
    showToast("Test plugin loaded!", "success");
  },
  
  onUnload() {
    console.log("[TEST] Plugin unloading...");
  }
};


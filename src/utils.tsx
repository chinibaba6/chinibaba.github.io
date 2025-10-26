// ============================================================================
// Utilities for Local Message Editor
// ============================================================================

const { showToast } = vendetta.ui.toasts;

// Modal state management
export let setModalVisible = null;
export let setCurrentMessage = null;

export function registerModalState(setVisible, setCurrent) {
  setModalVisible = setVisible;
  setCurrentMessage = setCurrent;
}

export function unregisterModalState() {
  setModalVisible = null;
  setCurrentMessage = null;
}

export function showEditModal(message) {
  if (setCurrentMessage && setModalVisible) {
    setCurrentMessage(message);
    setModalVisible(true);
  } else {
    showToast("Modal not ready, try again", "error");
  }
}


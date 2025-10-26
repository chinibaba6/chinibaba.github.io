// ============================================================================
// Storage helpers for Local Message Editor
// ============================================================================

const { storage } = vendetta.plugin;

export function initStorage() {
  if (!storage.edits) {
    storage.edits = {};
  }
  if (!storage.messageIdInput) {
    storage.messageIdInput = "";
  }
}

export function setEdit(messageId, content) {
  if (!storage.edits) storage.edits = {};
  storage.edits[messageId] = content;
}

export function getEdit(messageId) {
  return storage.edits?.[messageId];
}

export function hasEdit(messageId) {
  return messageId in (storage.edits || {});
}

export function clearEdit(messageId) {
  if (!storage.edits) return;
  delete storage.edits[messageId];
}

export { storage };


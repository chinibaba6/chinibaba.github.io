// ============================================================================
// Styles for Local Message Editor
// ============================================================================

const { ReactNative } = vendetta.metro.common;
const { semanticColors } = vendetta.ui;

const { StyleSheet } = ReactNative;

export const styles = StyleSheet.create({
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

export const iconStyles = StyleSheet.create({
  iconComponent: {
    width: 24,
    height: 24,
    tintColor: semanticColors?.INTERACTIVE_NORMAL || "#b9bbbe"
  }
});


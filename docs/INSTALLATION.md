# 📦 Installation Guide

## Quick Install

1. **Install Revenge** (if you haven't already)
   - Download from: https://github.com/revenge-mod/revenge-bundle
   - Follow their installation instructions

2. **Add this plugin**
   - Copy the entire plugin folder to your Revenge plugins directory
   - Or install via URL if you have it hosted

3. **Enable the plugin**
   - Open Discord with Revenge
   - Go to Revenge Settings → Plugins
   - Find "Local Message Editor"
   - Toggle it ON

4. **Verify it loaded**
   - Check console for: `[LocalMessageEditor] Plugin loaded successfully!`
   - Toast notification should appear: "LocalMessageEditor loaded"

---

## File Structure

Your plugin folder should look like this:

```
LocalMessageEditor/
├── index.tsx          ← Main plugin code
├── manifest.json      ← Plugin metadata
├── README.md          ← Documentation
├── FIXED_CHANGES.md   ← What was fixed
└── INSTALLATION.md    ← This file
```

---

## Verification Steps

### 1. Check Console Logs

Open Revenge console and look for:

```
[LocalMessageEditor] Loading plugin...
[LocalMessageEditor] MessageStore found: true
[LocalMessageEditor] ✓ Patched getMessage
[LocalMessageEditor] ✓ Patched getMessages
[LocalMessageEditor] ✓ Patched action sheet
[LocalMessageEditor] Plugin loaded successfully!
```

✅ If you see all these, the plugin is working!

### 2. Test Context Menu

1. Go to any Discord channel
2. Long-press on a message
3. Look for "📝 Edit Locally" option

✅ If you see it, context menu integration works!

### 3. Test Editing

1. Click "📝 Edit Locally"
2. Edit the message content
3. Click "Save"
4. Toast should show: "Message edited locally"
5. Message should display your edited content

✅ If the message shows your edit, everything works!

### 4. Test Persistence

1. Edit a message
2. Close Discord
3. Reopen Discord
4. Check if the message still shows your edit

✅ If it persists, storage works!

---

## Troubleshooting

### Plugin doesn't appear in list

**Cause:** manifest.json might be invalid

**Fix:**
1. Check manifest.json is valid JSON
2. Verify the file structure is correct
3. Restart Discord

### Plugin appears but won't enable

**Cause:** Import errors or syntax errors

**Fix:**
1. Check console for error messages
2. Verify index.tsx has no syntax errors
3. Make sure you're using a recent Revenge version

### "MessageStore not found" error

**Cause:** Discord changed their internal structure

**Fix:**
1. Enable debug mode
2. Use Revenge's module inspector
3. Find the correct module properties
4. Update line 200 in index.tsx:
   ```typescript
   const MessageStore = findByProps("getMessage", "getMessages");
   ```
   Replace with the correct property names

### Context menu doesn't show "Edit Locally"

**Cause:** Action sheet detection might be wrong

**Fix:**
1. Add debug logging at line 255:
   ```typescript
   console.log("[Debug] Action sheet:", key, props);
   ```
2. Long-press a message
3. Check console for the actual key name
4. Update line 258 if needed

### Edits don't show

**Cause:** Message patching might not be working

**Fix:**
1. Check if getMessage was patched (console logs)
2. Enable debug logging:
   ```typescript
   console.log("[Debug] getMessage result:", res);
   ```
3. Verify edits are being stored:
   ```typescript
   console.log("[Debug] Storage:", storage.edits);
   ```

---

## Advanced Configuration

### Change Storage Key

Edit line 44 if you want a different storage key:

```typescript
storage.edits ??= {};  // Change 'edits' to your preferred key
```

### Disable Toast Notifications

Comment out toast calls:

```typescript
// showToast("Message edited locally", "success");
```

### Add More Context Menu Options

Add more buttons in the action sheet patch (around line 268):

```typescript
React.createElement(
  Pressable,
  {
    onPress: () => {
      // Your custom action
    },
  },
  React.createElement(Text, null, "Custom Option")
)
```

---

## Uninstallation

1. Open Revenge Settings → Plugins
2. Find "Local Message Editor"
3. Toggle it OFF
4. Optionally delete the plugin folder

**Note:** Your edits will remain in storage. To clear them:

```javascript
// In console:
storage.edits = {};
```

---

## Updating

1. Disable the plugin
2. Replace the plugin files with new version
3. Re-enable the plugin
4. Check console to verify new version loaded

---

## Support

If you have issues:

1. **Check console logs** - They show what's happening
2. **Read FIXED_CHANGES.md** - Explains all fixes
3. **Check README.md** - Full documentation
4. **Enable debug logs** - Add console.log statements

---

## Compatibility

✅ **Tested with:**
- Revenge (latest)
- Vendetta (compatible)

⚠️ **May need updates if:**
- Discord changes internal API
- Revenge changes plugin structure

---

## Performance

The plugin is lightweight:
- Minimal memory usage
- Fast patching with negligible overhead
- Efficient storage (only stores edited messages)
- No network requests

---

## Privacy

This plugin is completely local:
- ✅ No data sent to any server
- ✅ Edits stored only on your device
- ✅ No tracking or analytics
- ✅ Open source - verify the code yourself

---

## Next Steps

Once installed and working:

1. Edit some messages to test
2. Check that edits persist after restart
3. Try clearing an edit
4. Explore the code to understand how it works
5. Consider contributing improvements!

Enjoy your locally edited messages! 📝


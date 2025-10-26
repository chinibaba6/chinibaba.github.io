# 🐛 Debugging Guide - Local Message Editor v3.4.0

## ✨ New Features

### 1. **Enhanced Debugging Logs** 🔍
The action sheet patch now logs **every single step** to help identify where things go wrong.

### 2. **Slash Command** ⌨️
New `/edit` command for editing messages!

```
/edit <message_id> [channel_id]
```

## 📱 Three Ways to Edit Messages

| Method | How to Use | Status |
|--------|-----------|--------|
| **1. Long-press** | Long-press message → "Edit Locally" | If working |
| **2. /edit command** | `/edit 123456789 987654321` | ✅ NEW! |
| **3. Settings** | Plugin Settings → Enter message ID | Always works |

## 🔍 How to Debug Action Sheet Issue

### Step 1: Enable Console Logging

1. Open Discord
2. Go to **Settings** → **Appearance** → Enable **Developer Mode**
3. Open **Console/Debug Logs** (method varies by client)

### Step 2: Reload Plugin

1. Toggle the plugin **OFF**
2. Toggle it back **ON**
3. Watch the console

### Step 3: Check Module Detection

Look for this in console logs:

```
[LocalMessageEditor] 🔍 Module Detection:
  - LazyActionSheet: true/false
  - LazyActionSheet.openLazy: true/false
  - MessageStore: true/false
  - ActionSheetRow: true/false
  - i18n: true/false
  - i18n.Messages.MARK_UNREAD: "..."
```

**✅ If all are `true`**, modules loaded correctly!  
**❌ If any are `false`**, that module is missing (Revenge API issue)

### Step 4: Long-Press a Message

Look for these logs:

```
[LocalMessageEditor] 📥 openLazy called:
  - key: MessageLongPressActionSheet
  - has message: true
  - message.id: 123456789
```

**✅ If you see this**, the patch is intercepting the menu!  
**❌ If you don't**, the patch isn't being called

### Step 5: Check Button Finding

Look for:

```
[LocalMessageEditor] 🔍 Searching for buttons array...
[LocalMessageEditor] ✅ Found buttons array!
  - buttons.length: 8
  - First button label: "Reply"
  - MARK_UNREAD index: 5
  - Insert position: 5
```

**✅ If you see this**, buttons array was found!  
**❌ If you see "Buttons array not found"**, the React tree structure is different

### Step 6: Check Button Creation

Look for:

```
[LocalMessageEditor] ✅✅✅ 'Edit Locally' button added!
```

**✅ If you see this**, the button was added successfully!  
**❌ If not**, something failed during button creation

## 🆘 Common Issues

### Issue 1: "Buttons array not found"

**Possible Causes:**
- Discord updated the UI structure
- dislate pattern doesn't match your Revenge version

**Solutions:**
- Try the `/edit` command instead (always works!)
- Use Settings page manual input
- Share console logs for further debugging

### Issue 2: Button added but not visible

**Possible Causes:**
- Button added at wrong position
- Icon not loading
- Style issues

**Check:**
- Does console show "Button inserted at position X"?
- What is the MARK_UNREAD index?

### Issue 3: Button visible but doesn't work

**Look for:**
```
[LocalMessageEditor] 🖱️ Edit button pressed!
```

If you see this when clicking, the button works but modal has issues.

## 💡 Using the /edit Command (Always Works!)

### Get Message ID:

1. **Enable Developer Mode** in Discord settings
2. **Long-press a message**
3. Tap **"Copy ID"** or **"Copy Message Link"**
4. You'll get something like: `123456789012345678`

### Use the command:

```
/edit 123456789012345678
```

Or with channel ID:

```
/edit 123456789012345678 987654321098765432
```

The modal will open automatically! ✨

## 📊 Log Levels

| Symbol | Meaning |
|--------|---------|
| 🔍 | Information/Detection |
| ✅ | Success |
| ⚠️ | Warning (not critical) |
| ❌ | Error (something failed) |
| 📥 | Input received |
| 📦 | Module loaded |
| 🖱️ | User interaction |

## 🚀 Reporting Issues

If the action sheet still doesn't work, please provide:

1. **Console logs** (search for "LocalMessageEditor")
2. **Revenge/Vendetta version**
3. **Discord client version**
4. **Device/OS**

Even if the action sheet doesn't work, you can still use:
- ✅ `/edit` command
- ✅ Settings page manual input

Both work 100% of the time! 🎯


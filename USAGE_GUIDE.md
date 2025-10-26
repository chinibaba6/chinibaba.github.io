# 📖 Usage Guide - Local Message Editor

## 🎯 What This Plugin Does

Edit Discord messages **locally** on your device. Your edits are only visible to you and don't sync to the server or other devices.

**Use cases:**
- Fix typos in messages you're reading
- Censor spoilers or sensitive info for yourself
- Replace text with jokes for screenshots
- Remove annoyances from messages

## 🚀 Quick Start

### Method 1: Long-Press Menu (Fastest)

1. Long-press any message
2. Tap **"Edit Locally"** (if available)
3. Edit the text
4. Tap **"Save"**

✅ **Pros:** Fast, intuitive  
❌ **Cons:** May not work on all Revenge versions

---

### Method 2: /edit Command (Reliable)

1. Copy the message ID:
   - Long-press message → **"Copy ID"**
   - Or tap message → **"Copy Message Link"**

2. Type the command:
   ```
   /edit <message_id>
   ```
   Example:
   ```
   /edit 1234567890123456789
   ```

3. The editor opens automatically!
4. Edit and save

✅ **Pros:** Always works, reliable  
❌ **Cons:** Requires copying message ID

**Pro Tip:** If message isn't found, add channel ID:
```
/edit 1234567890123456789 9876543210987654321
```

---

### Method 3: Settings Page (Manual)

1. Open **Plugin Settings** → **Local Message Editor**
2. Enter **Message ID**
3. (Optional) Enter **Channel ID**
4. Tap **"Edit Message"**
5. Edit and save

✅ **Pros:** Always works, full control  
❌ **Cons:** Slowest method

---

## 🆔 How to Get Message ID

### Enable Developer Mode:
1. Discord Settings
2. Appearance → **Developer Mode** → ON

### Copy Message ID:
- **Method A:** Long-press message → **"Copy ID"**
- **Method B:** Tap message → **"Copy Message Link"**
  - Link looks like: `https://discord.com/channels/.../.../.../1234567890`
  - The last number is the message ID

---

## 📝 Examples

### Example 1: Edit a Message
**Original:** "I love pineapple on pizza"  
**Your edit:** "I don't love pineapple on pizza"  
**Result:** Only you see the edited version!

### Example 2: Remove Spoilers
**Original:** "Darth Vader is Luke's father!"  
**Your edit:** "[SPOILERS REMOVED]"  
**Result:** You can read the channel without spoilers!

### Example 3: Fix Typos (for yourself)
**Original:** "I cant belive this happenned!"  
**Your edit:** "I can't believe this happened!"  
**Result:** Easier to read!

---

## 🗑️ Clearing Edits

### Method 1: In Editor
1. Open the message editor
2. Tap **"Clear"** button
3. Original message restored

### Method 2: In Settings
1. Open Plugin Settings
2. Scroll to **"Currently Edited Messages"**
3. Tap on any message to clear it

---

## ❓ FAQ

**Q: Do other people see my edits?**  
A: No! Edits are local to your device only.

**Q: Will edits sync to my other devices?**  
A: No, edits are per-device.

**Q: Can I edit anyone's messages?**  
A: Yes! You can locally edit any message you can see.

**Q: What happens if I reinstall the plugin?**  
A: Your edits are saved in plugin storage and will persist.

**Q: Can I edit images/embeds?**  
A: No, only text content.

**Q: Does this work in DMs?**  
A: Yes! Works everywhere.

**Q: Why isn't the long-press button showing?**  
A: Try the `/edit` command or Settings page instead. See DEBUGGING_GUIDE.md

---

## ⚙️ Settings Page Features

### 📝 Edit a Message
- Input for Message ID
- Input for Channel ID (optional)
- "Edit Message" button

### ✏️ Currently Edited Messages
- See all your local edits
- Tap to clear individual edits
- Shows message ID and preview

### ℹ️ Instructions
- How to get Message/Channel ID
- Step-by-step guide

---

## 💡 Pro Tips

1. **Use /edit for speed:** Faster than opening Settings
2. **Copy IDs in bulk:** Copy several message IDs, then edit them all
3. **Check edited list:** Regularly review your edits in Settings
4. **Clear old edits:** Remove edits you no longer need to save memory

---

## 🎨 Use Cases

- **Reading Comprehension:** Fix typos in long threads
- **Privacy:** Censor personal info in shared screenshots
- **Humor:** Replace text with jokes before screenshotting
- **Organization:** Tag messages with your own notes
- **Spoiler Avoidance:** Hide spoilers in channels
- **Translation Notes:** Add translations next to foreign text

---

## 🚨 Important Notes

⚠️ **Edits are local only** - They don't change the actual message on Discord's servers

⚠️ **Don't rely on edits for security** - The original message still exists

⚠️ **Edits don't transfer** - They're stored on your current device only

✅ **Safe to use** - This plugin only modifies what YOU see

✅ **Reversible** - You can always clear edits and see the original

---

## 🆘 Need Help?

- **Action sheet not working?** → See DEBUGGING_GUIDE.md
- **Command not found?** → Make sure plugin is enabled
- **Message not found?** → Try adding the channel ID
- **Modal won't open?** → Check console logs for errors

**Remember:** Even if one method doesn't work, the other two methods always work! 🎯


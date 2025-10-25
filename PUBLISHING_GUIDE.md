# 📦 Publishing Guide - Local Message Editor

Complete guide to publish and install your Revenge/Vendetta plugin.

---

## 🎯 Three Ways to Publish

1. **[Method 1: GitHub (Recommended)](#method-1-github-recommended)** - Host on GitHub, install via URL
2. **[Method 2: Local Installation](#method-2-local-installation-testing)** - Direct file copy for testing
3. **[Method 3: Custom Hosting](#method-3-custom-hosting)** - Any web server

---

## Method 1: GitHub (Recommended) ⭐

This is the most common and easiest method for distribution.

### Step 1: Prepare Your Repository

1. **Clean up the folder:**
   ```powershell
   cd "e:\my project"
   
   # Remove temporary files
   Remove-Item "my project.rar" -ErrorAction SilentlyContinue
   Remove-Item "New folder" -Recurse -ErrorAction SilentlyContinue
   ```

2. **Your clean structure should be:**
   ```
   local-message-editor/
   ├── manifest.json
   ├── README.md
   ├── CHANGELOG.md
   ├── LICENSE
   ├── .gitignore
   ├── src/
   │   └── index.tsx
   └── docs/
       └── (all docs)
   ```

### Step 2: Initialize Git Repository

```bash
cd "e:\my project"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial release v2.1.0 - Production ready"
```

### Step 3: Create GitHub Repository

1. **Go to GitHub:** https://github.com/new
2. **Repository settings:**
   - Name: `local-message-editor`
   - Description: `Edit Discord messages locally for Revenge/Vendetta`
   - Visibility: Public
   - **DON'T** initialize with README (we already have one)
3. Click **"Create repository"**

### Step 4: Push to GitHub

GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/local-message-editor.git
git branch -M main
git push -u origin main
```

### Step 5: Create a Release (Optional but Recommended)

1. Go to your repository on GitHub
2. Click **"Releases"** → **"Create a new release"**
3. **Tag version:** `v2.1.0`
4. **Release title:** `Local Message Editor v2.1.0 - Production Ready`
5. **Description:** Copy from CHANGELOG.md
6. Click **"Publish release"**

### Step 6: Get Installation URL

Your plugin URL will be:
```
https://github.com/YOUR_USERNAME/local-message-editor
```

Or for specific file:
```
https://raw.githubusercontent.com/YOUR_USERNAME/local-message-editor/main/manifest.json
```

---

## 📲 How Users Install (GitHub Method)

### For Revenge:

1. **Open Discord with Revenge**
2. **Go to:** Revenge Settings → Plugins
3. **Click:** "Add Plugin" or "Install Plugin"
4. **Enter URL:**
   ```
   https://github.com/YOUR_USERNAME/local-message-editor
   ```
5. **Click:** Install
6. **Enable** the plugin
7. Done! ✅

### For Vendetta:

1. **Open Discord with Vendetta**
2. **Go to:** Vendetta Settings → Plugins
3. **Click:** "+" or "Install Plugin"
4. **Enter URL:**
   ```
   https://github.com/YOUR_USERNAME/local-message-editor
   ```
5. **Click:** Install
6. **Enable** the plugin
7. Done! ✅

---

## Method 2: Local Installation (Testing)

For testing before publishing, or if you don't want to use GitHub.

### Step 1: Locate Plugins Folder

**For Revenge:**
- Android: `/sdcard/revenge/plugins/` or `/storage/emulated/0/revenge/plugins/`
- iOS: Use a file manager app with root access

**For Vendetta:**
- Android: `/sdcard/vendetta/plugins/` or `/storage/emulated/0/vendetta/plugins/`
- iOS: Use a file manager app

### Step 2: Copy Plugin Folder

1. **Connect your device** to your computer
2. **Navigate to** the plugins folder
3. **Create a new folder** named `local-message-editor`
4. **Copy all files** from `e:\my project\` into that folder:
   ```
   plugins/local-message-editor/
   ├── manifest.json
   ├── src/
   │   └── index.tsx
   └── (rest of files)
   ```

### Step 3: Enable Plugin

1. **Open Discord** with Revenge/Vendetta
2. **Go to Settings** → Plugins
3. **Find** "Local Message Editor"
4. **Enable** it
5. Done! ✅

### Step 4: Verify Installation

Check console for:
```
[LocalMessageEditor] Loading plugin...
[LocalMessageEditor] MessageStore found
[LocalMessageEditor] ✓ Patched getMessage
[LocalMessageEditor] ✓ Patched getMessages
[LocalMessageEditor] ✓ Patched action sheet
[LocalMessageEditor] Plugin loaded successfully!
```

---

## Method 3: Custom Hosting

If you have your own web server.

### Step 1: Prepare Files

Create a structure accessible via HTTP:
```
https://your-domain.com/plugins/local-message-editor/
├── manifest.json
├── src/
│   └── index.tsx
└── (other files)
```

### Step 2: Enable CORS

Your server must allow CORS for Revenge/Vendetta to download files.

**For Apache (.htaccess):**
```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
</IfModule>
```

**For Nginx:**
```nginx
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods "GET, OPTIONS";
```

### Step 3: Installation URL

Users install with:
```
https://your-domain.com/plugins/local-message-editor
```

---

## 🎨 Making It Look Professional

### Add a Banner/Icon

1. Create `icon.png` (512x512 recommended)
2. Place in root folder
3. Update manifest.json:
   ```json
   {
     "vendetta": {
       "icon": "https://your-url/icon.png"
     }
   }
   ```

### Add Screenshots

1. Create `screenshots/` folder
2. Add screenshots of your plugin in action
3. Reference in README.md

### Update README

Add installation badge:
```markdown
[![Install](https://img.shields.io/badge/Install-Revenge%2FVendetta-blue)](https://github.com/YOUR_USERNAME/local-message-editor)
```

---

## 📢 Promoting Your Plugin

### Share on:

1. **Revenge Discord Server**
   - Share in #plugins channel
   - Include: URL, description, screenshots

2. **Vendetta Discord Server**
   - Share in #plugins channel
   - Follow their sharing guidelines

3. **Reddit**
   - r/discordapp
   - r/Discord_Bots (if applicable)

4. **GitHub Topics**
   - Add topics: `revenge`, `vendetta`, `discord`, `plugin`, `discord-mobile`

---

## 🔄 Updating Your Plugin

### When you make changes:

```bash
# 1. Make your changes to src/index.tsx

# 2. Update version in manifest.json
# Change: "version": "2.1.0" → "version": "2.2.0"

# 3. Update CHANGELOG.md
# Add new version section with changes

# 4. Commit and push
git add .
git commit -m "Release v2.2.0: [describe changes]"
git push

# 5. Create new release on GitHub (optional)
# Tag: v2.2.0
```

### Users update automatically:
- Most Revenge/Vendetta setups auto-update plugins
- Or users can manually click "Update" in plugin settings

---

## ✅ Pre-Publish Checklist

Before publishing, verify:

- [ ] All files are in correct folders (`src/`, `docs/`)
- [ ] `manifest.json` has correct `"main": "src/index.tsx"`
- [ ] No personal/sensitive information in code
- [ ] LICENSE file is present
- [ ] README.md has installation instructions
- [ ] .gitignore excludes unnecessary files
- [ ] No `my project.rar` or temp folders
- [ ] Version number is correct (v2.1.0)
- [ ] CHANGELOG.md is up to date
- [ ] Code has been tested locally

---

## 🐛 Troubleshooting Publishing

### "Plugin won't install from URL"
- Check URL is correct and public
- Verify CORS is enabled (if custom hosting)
- Ensure manifest.json is valid JSON
- Check `"main"` path in manifest.json

### "Plugin installs but won't load"
- Check console for errors
- Verify `"main": "src/index.tsx"` path is correct
- Ensure all imports are correct
- Test locally first

### "GitHub repository not found"
- Ensure repository is **public**
- Check URL spelling
- Wait a few minutes after creating repo

---

## 📝 Example URLs

After publishing to GitHub, your URLs will be:

**Repository:**
```
https://github.com/YOUR_USERNAME/local-message-editor
```

**Installation URL (for Revenge/Vendetta):**
```
https://github.com/YOUR_USERNAME/local-message-editor
```

**Raw manifest (if needed):**
```
https://raw.githubusercontent.com/YOUR_USERNAME/local-message-editor/main/manifest.json
```

**Raw source code:**
```
https://raw.githubusercontent.com/YOUR_USERNAME/local-message-editor/main/src/index.tsx
```

---

## 🎉 Quick Start (Fastest Method)

### For Immediate Testing:

1. **Copy to device:**
   ```
   Copy "e:\my project" folder to 
   /sdcard/revenge/plugins/local-message-editor/
   ```

2. **Enable in Revenge settings**

3. **Test it works**

### For Distribution:

1. **Push to GitHub** (5 minutes)
2. **Share the URL** (1 minute)
3. **Users install** with that URL
4. Done! 🚀

---

## 📞 Need Help?

- **GitHub Issues**: Enable issues on your repo for bug reports
- **Revenge Discord**: Ask in #plugin-development
- **Vendetta Discord**: Ask in #help or #plugins

---

## 🎊 Success!

Once published, users can install with:

```
https://github.com/YOUR_USERNAME/local-message-editor
```

And your plugin will be live! 🚀

---

**Next Steps:**
1. Choose a publishing method (GitHub recommended)
2. Follow the steps above
3. Share your plugin URL
4. Help users who have questions

Good luck with your plugin! 🎉


# ⚡ Quick Publish Guide (5 Minutes)

## 🚀 Fastest Way to Publish Your Plugin

### Prerequisites:
- GitHub account
- Git installed
- Plugin tested locally

---

## 📋 Step-by-Step (Copy & Paste)

### 1️⃣ Clean Up (30 seconds)

```powershell
cd "e:\my project"
Remove-Item "my project.rar" -ErrorAction SilentlyContinue
Remove-Item "New folder" -Recurse -ErrorAction SilentlyContinue
```

### 2️⃣ Initialize Git (30 seconds)

```bash
git init
git add .
git commit -m "Initial release v2.1.0"
```

### 3️⃣ Create GitHub Repo (1 minute)

1. Go to: https://github.com/new
2. Name: `local-message-editor`
3. Public repository
4. **DON'T** check any boxes
5. Click "Create repository"

### 4️⃣ Push to GitHub (1 minute)

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/local-message-editor.git
git branch -M main
git push -u origin main
```

### 5️⃣ Done! Share URL (30 seconds)

Your installation URL:
```
https://github.com/YOUR_USERNAME/local-message-editor
```

---

## 📱 How Users Install

### In Revenge/Vendetta:

1. Settings → Plugins
2. Click "+" or "Install"
3. Paste: `https://github.com/YOUR_USERNAME/local-message-editor`
4. Enable plugin
5. Done! ✅

---

## 🧪 Test Before Publishing

### Quick Local Test:

1. Copy folder to: `/sdcard/revenge/plugins/local-message-editor/`
2. Enable in Revenge settings
3. Test editing messages
4. If works → Publish to GitHub!

---

## ✅ Checklist

- [ ] Plugin tested locally
- [ ] Temp files removed (`*.rar`, `New folder`)
- [ ] Git initialized
- [ ] GitHub repo created
- [ ] Code pushed to GitHub
- [ ] URL shared with users

---

## 🆘 Common Issues

**"Git not found"**
→ Install Git: https://git-scm.com/download/win

**"Permission denied"**
→ Generate SSH key or use HTTPS with token

**"Plugin won't install"**
→ Make sure repo is **public**, not private

---

## 📊 Alternative: Direct File Transfer

If you don't want GitHub:

```
1. Connect phone to PC
2. Copy folder to: /sdcard/revenge/plugins/
3. Rename to: local-message-editor
4. Enable in Revenge settings
```

---

## 🎉 That's It!

Your plugin is now published and installable!

**For detailed guide:** See [PUBLISHING_GUIDE.md](./PUBLISHING_GUIDE.md)

---

**Total Time:** ~5 minutes  
**Difficulty:** Easy  
**Result:** Published plugin! 🚀


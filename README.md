# 🔐 Zipper — Password-Protected ZIP GUI (macOS)

Aplikasi desktop berbasis [Electron](https://www.electronjs.org/) untuk membuat **arsip ZIP terenkripsi AES-256** via [7-Zip](https://www.7-zip.org/) dengan **drag & drop**.

Repo: https://github.com/lelehuy/Zipper.dmg

---

## ✨ Fitur
- 📦 Buat **.zip** terenkripsi **AES-256** (7-Zip)
- 🔒 Otomatis membuat file `<nama>_password.txt`
- 📂 Drag & drop **file** atau **folder**
- 🍎 Build `.dmg` siap install di macOS (drag to Applications)

---

## 📦 Dev Setup

**Prasyarat:**
- Node.js (`brew install node`)
- 7-Zip (`brew install sevenzip` atau `brew install 7zip`)

**Jalankan:**
```bash
npm install
npm run dev

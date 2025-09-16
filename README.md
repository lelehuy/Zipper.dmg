# 🔐 Zipper — Password-Protected ZIP GUI

Zipper adalah aplikasi desktop sederhana berbasis [Electron](https://www.electronjs.org/) untuk membuat **arsip ZIP dengan proteksi password (AES-256)** secara **drag & drop**.  
Dibuat khusus untuk pengguna :contentReference[oaicite:1]{index=1}, ringan, dan bisa dipaketkan ke `.dmg`.

---

## ✨ Fitur

- 📦 Buat file **.zip** terenkripsi AES-256 via [7-Zip](https://www.7-zip.org/)
- 🔒 Otomatis membuat file `<nama>_password.txt` berisi password
- 📂 Dukungan **drag & drop** file **atau** folder
- ⚡ Antarmuka minimalis & ringan (tanpa dependencies berat)
- 🍎 Build `.dmg` siap install di macOS (drag to Applications)

---

## 🖥️ Pratinjau Antarmuka

![UI Preview](docs/screenshot.png)

> 💡 Latar terang, bersih, dan intuitif — tinggal pilih file/folder, masukkan password, klik **Buat ZIP**.

---

## 📦 Cara Install & Jalankan (Dev)

Pastikan sudah terpasang:

- [Node.js](https://nodejs.org/) (via [Homebrew](https://brew.sh/): `brew install node`)
- [7-Zip](https://www.7-zip.org/) (via Homebrew: `brew install sevenzip`)

Lalu jalankan:

```bash
# clone repo ini
git clone https://github.com/USERNAME/zipper.git
cd zipper

# install dependencies
npm install

# jalankan mode dev
npm run dev

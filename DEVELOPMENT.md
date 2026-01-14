# Zipper Development Guide

This document is for developers who want to contribute to Zipper or build it from source.

## 🛠 Tech Stack
- **Framework**: Electron
- **Compression Engine**: 7-Zip (CLI)
- **Encryption**: AES-256
- **Styling**: Vanilla CSS (Slate theme)
- **Updates**: `electron-updater` (GitHub provider)

## 📋 Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- [7-Zip](https://www.7-zip.org/) (Required for the compression engine)
  - On macOS: `brew install sevenzip`

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/lelehuy/ZipperElectron.git
   cd ZipperElectron
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run dev
   ```

## 🏗 Building

To package the application for macOS (.dmg):

```bash
npm run build
```

The output will be generated in the `dist/` directory.

## 📁 Project Structure
- `src/main.js`: Electron main process (IPC, window management, 7-zip command execution).
- `src/renderer/`: Renderer process (UI, Drag-and-drop logic).
- `assets/`: Icons and static assets.
- `electron-builder.yml`: Build configuration.

## 🤝 Contributing
Feel free to open issues or submit pull requests to improve the project!

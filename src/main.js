const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const isMac = process.platform === 'darwin';

/* ---- Ensure PATH includes Homebrew bins (Electron often has a shorter PATH) ---- */
(function augmentPATH() {
  const extra = ['/opt/homebrew/bin', '/usr/local/bin'];
  const parts = (process.env.PATH || '').split(':').filter(Boolean);
  for (const p of extra) if (!parts.includes(p)) parts.unshift(p);
  process.env.PATH = parts.join(':');
})();

function createWindow() {
  const win = new BrowserWindow({
    width: 760,
    height: 560,
    title: 'Zipper (AES)',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    }
  });
  win.removeMenu?.();
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

/* ---------------- Utils ---------------- */
function whichCmd(cmd) {
  // return absolute path string if found, else null
  return new Promise((resolve) => {
    const sh = isMac ? 'bash' : 'cmd';
    const args = isMac ? ['-lc', `command -v ${cmd} || which ${cmd}`] : ['/c', `where ${cmd}`];
    let out = '';
    const ps = spawn(sh, args, { env: process.env });
    ps.stdout.on('data', d => out += d.toString());
    ps.on('exit', code => {
      out = (out || '').trim().split(/\r?\n/)[0] || '';
      resolve(code === 0 && out ? out : null);
    });
  });
}

async function findSevenZip() {
  // try common names: 7z (old p7zip), 7za (alt), 7zz (new sevenzip)
  const candidates = ['7z', '7za', '7zz'];
  for (const c of candidates) {
    const p = await whichCmd(c);
    if (p) return p;
  }
  // also brute-force common brew paths if which failed (rare)
  const fallbacks = [
    '/opt/homebrew/bin/7zz', '/opt/homebrew/bin/7z', '/opt/homebrew/bin/7za',
    '/usr/local/bin/7zz', '/usr/local/bin/7z', '/usr/local/bin/7za'
  ];
  for (const f of fallbacks) {
    try { if (fs.existsSync(f)) return f; } catch (_) { }
  }
  return null;
}

function sanitizeName(name) {
  return name
    .replace(/[\/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

function deriveOutputPaths(srcPath, outDir, outName) {
  const srcBase = path.basename(srcPath.replace(/\/+$/, ''));
  const baseName = sanitizeName(outName && outName.trim() ? outName : srcBase);
  const zipPath = path.join(outDir, `${baseName}.zip`);
  const passTxt = path.join(outDir, `${baseName}_password.txt`);
  return { zipPath, passTxt };
}

/** Build ZIP with 7-Zip in ZIP mode + AES-256 (no -mhe, only for 7z format) */
function zipWith7z(toolPath, srcPath, zipPath, password) {
  return new Promise((resolve, reject) => {
    try { if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath); } catch (_) { }

    const args = [
      'a',             // add
      '-tzip',         // zip container
      `-p${password}`, // password
      '-mem=AES256',   // AES-256 encryption
      '-y',            // auto yes
      zipPath,         // output
      srcPath          // input
    ];
    try { if (fs.statSync(srcPath).isDirectory()) args.push('-r'); } catch (_) { }

    const child = spawn(toolPath, args, { env: process.env });
    let stderr = ''; let stdout = '';
    child.stderr.on('data', d => { stderr += d.toString(); });
    child.stdout.on('data', d => { stdout += d.toString(); });
    child.on('exit', code => {
      if (code === 0) return resolve();
      reject(new Error(`${toolPath} exit ${code}: ${stderr || stdout}`));
    });
  });
}

/* ---------------- IPC ---------------- */
ipcMain.handle('pick-output-dir', async () => {
  const r = await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] });
  if (r.canceled) return null;
  return r.filePaths[0];
});

ipcMain.handle('pick-source', async () => {
  const r = await dialog.showOpenDialog({ properties: ['openFile', 'openDirectory', 'dontAddToRecent'] });
  if (r.canceled) return null;
  return r.filePaths[0];
});

ipcMain.handle('zip-do', async (_evt, payload) => {
  const { srcPath, outDir, outName, password } = payload || {};
  if (!srcPath || !fs.existsSync(srcPath)) throw new Error('Sumber tidak valid.');
  if (!outDir || !fs.existsSync(outDir)) throw new Error('Folder output tidak valid.');
  if (!password || !password.trim()) throw new Error('Password kosong.');

  const { zipPath, passTxt } = deriveOutputPaths(srcPath, outDir, outName);

  const toolPath = await findSevenZip();
  if (!toolPath) {
    throw new Error(
      '7-Zip tidak ditemukan. Install: `brew install sevenzip` (atau `brew install 7zip` di beberapa tap). ' +
      'Binary yang dicari: 7zz/7z/7za. Setelah install, coba tutup & buka ulang app.'
    );
  }

  await zipWith7z(toolPath, srcPath, zipPath, password);
  fs.writeFileSync(passTxt, `${password}\n`, { encoding: 'utf8', flag: 'w' });

  return { ok: true, zipPath, passTxt, used: path.basename(toolPath) };
});

ipcMain.handle('reveal-in-finder', async (_evt, p) => {
  if (p && fs.existsSync(p)) shell.showItemInFolder(p);
  return true;
});

/* ---------------- Auto Updater ---------------- */
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

ipcMain.handle('check-for-updates', () => {
  autoUpdater.checkForUpdates();
});

ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall();
});

autoUpdater.on('checking-for-update', () => {
  BrowserWindow.getAllWindows().forEach(w => w.webContents.send('update-message', 'Checking...'));
});

autoUpdater.on('update-available', (info) => {
  BrowserWindow.getAllWindows().forEach(w => w.webContents.send('update-message', `New v${info.version} found. Downloading...`));
});

autoUpdater.on('update-not-available', (info) => {
  BrowserWindow.getAllWindows().forEach(w => w.webContents.send('update-message', `Latest version installed.`));
});

autoUpdater.on('error', (err) => {
  BrowserWindow.getAllWindows().forEach(w => w.webContents.send('update-message', `Error: ${err.message}`));
});

autoUpdater.on('download-progress', (progressObj) => {
  const msg = `Downloading: ${progressObj.percent.toFixed(0)}%`;
  BrowserWindow.getAllWindows().forEach(w => w.webContents.send('update-message', msg));
});

autoUpdater.on('update-downloaded', (info) => {
  BrowserWindow.getAllWindows().forEach(w => w.webContents.send('update-downloaded', info));
});

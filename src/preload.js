const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ZipperAPI', {
  pickOutputDir: () => ipcRenderer.invoke('pick-output-dir'),
  pickSource: () => ipcRenderer.invoke('pick-source'),
  zipDo: (payload) => ipcRenderer.invoke('zip-do', payload),
  revealInFinder: (p) => ipcRenderer.invoke('reveal-in-finder', p),
  
  // Auto-updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onUpdateMessage: (callback) => ipcRenderer.on('update-message', (_event, text) => callback(text)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (_event, info) => callback(info))
});

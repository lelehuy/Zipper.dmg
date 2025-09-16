const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ZipperAPI', {
  pickOutputDir: () => ipcRenderer.invoke('pick-output-dir'),
  pickSource: () => ipcRenderer.invoke('pick-source'),
  zipDo: (payload) => ipcRenderer.invoke('zip-do', payload),
  revealInFinder: (p) => ipcRenderer.invoke('reveal-in-finder', p)
});

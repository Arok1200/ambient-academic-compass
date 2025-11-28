const { contextBridge, ipcRenderer } = require('electron');

// Expose a secure API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  
  // Toggle desktop widgets functionality
  toggleDesktopWidgets: () => {
    return ipcRenderer.invoke('toggle-desktop-widgets');
  },
  
  // Update desktop overlay colors when changed in main interface
  updateDesktopColors: (colors) => {
    return ipcRenderer.invoke('update-desktop-colors', colors);
  },
  
  // Listen for color updates in the desktop overlay
  onUpdateColors: (callback) => {
    ipcRenderer.on('update-colors', (event, colors) => {
      callback(colors);
    });
  },

  setOverlayAcceptsMouse: (accept) => ipcRenderer.send('overlay-accept-events', accept)
});
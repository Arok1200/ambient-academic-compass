const { app, BrowserWindow, ipcMain, Menu, Tray, screen, nativeImage } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow = null;
let desktopOverlay = null;
let tray = null;
let isInDesktopMode = false;
let ambientVisibilityTimer = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // No automatic show/hide - we'll handle this in toggleDesktopWidgets

  // Prevent app from quitting when main window is closed (we might be in desktop mode)
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (!isInDesktopMode) {
      app.quit();
    }
  });

  return mainWindow;
}

function createDesktopOverlay() {
  const displays = screen.getAllDisplays();
  const primaryDisplay = displays[0];
  const { width: screenWidth, height: screenHeight } = primaryDisplay.bounds;

  desktopOverlay = new BrowserWindow({
    x: 0,
    y: 0,
    width: screenWidth,
    height: screenHeight,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    focusable: false,
    hasShadow: false,
    backgroundColor: '#00000000', // Fully transparent
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  // Load the desktop sync HTML directly
  desktopOverlay.loadFile(path.join(__dirname, '../public/desktop/desktop-sync.html'));

  // Ensure truly transparent background
  desktopOverlay.setBackgroundColor('#00000000');

  // Configure for all workspaces BEFORE showing
  if (process.platform === 'darwin') {
    // macOS-specific: Apply all settings before showing
    desktopOverlay.setFullScreenable(false);
    desktopOverlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    // Use 'floating' level to keep it above normal windows but below modals
    desktopOverlay.setAlwaysOnTop(true, 'floating', 1);
  } else {
    // Other platforms
    desktopOverlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    desktopOverlay.setAlwaysOnTop(true, 'floating', 1);
  }
  
  desktopOverlay.setIgnoreMouseEvents(true, { forward: true });
  
  // Show the overlay after all settings are configured
  desktopOverlay.show();

  // Prevent the overlay from ever being hidden
  desktopOverlay.on('hide', () => {
    if (isInDesktopMode) {
      desktopOverlay.show();
    }
  });

  desktopOverlay.on('minimize', () => {
    if (isInDesktopMode) {
      desktopOverlay.restore();
    }
  });

  desktopOverlay.on('closed', () => {
    desktopOverlay = null;
    isInDesktopMode = false;
    if (ambientVisibilityTimer) {
      clearInterval(ambientVisibilityTimer);
      ambientVisibilityTimer = null;
    }
  });

  return desktopOverlay;
}

// Function to ensure ambient visibility persists
function enforceAmbientVisibility() {
  if (desktopOverlay && isInDesktopMode) {
    try {
      if (!desktopOverlay.isVisible()) {
        desktopOverlay.show();
      }
      if (!desktopOverlay.isAlwaysOnTop()) {
        desktopOverlay.setAlwaysOnTop(true, 'floating', 1);
      }
      desktopOverlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    } catch (e) {
      console.log('Error enforcing ambient visibility:', e);
    }
  }
}

function toggleDesktopWidgets() {
  if (isInDesktopMode) {
    // Exit desktop mode - show main window and hide overlay
    isInDesktopMode = false;
    if (ambientVisibilityTimer) {
      clearInterval(ambientVisibilityTimer);
      ambientVisibilityTimer = null;
    }
    // Hide the overlay when showing main window
    if (desktopOverlay && !desktopOverlay.isDestroyed()) {
      desktopOverlay.hide();
    }
    if (!mainWindow || mainWindow.isDestroyed()) {
      createMainWindow();
    } else {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.moveTop();
      // Ensure window is clickable
      if (process.platform === 'darwin') {
        app.focus({ steal: true });
      }
    }
  } else {
    // Enter desktop mode - close main window and show overlay on all desktops
    isInDesktopMode = true;
    if (mainWindow) {
      mainWindow.hide();
    }
    if (!desktopOverlay) {
      createDesktopOverlay();
    } else {
      desktopOverlay.show();
    }
    
    // Start ambient visibility enforcement - check every 2 seconds
    ambientVisibilityTimer = setInterval(enforceAmbientVisibility, 2000);
  }
}

function createSystemTray() {
  // Create a system tray icon (macOS compatible)
  let trayIcon;
  try {
    // Use tray.png (32x32 PNG optimized for macOS menu bar)
    const iconPath = path.join(__dirname, '../public/tray.png');
    trayIcon = nativeImage.createFromPath(iconPath);
    
    // On macOS, mark as template for automatic dark/light mode adaptation
    if (process.platform === 'darwin') {
      trayIcon.setTemplateImage(true);
    }
    
    tray = new Tray(trayIcon);
    tray.setIgnoreDoubleClickEvents(true);
  } catch (e) {
    console.error('Failed to load tray icon:', e);
    // Fallback to a simple dot
    tray = new Tray(nativeImage.createEmpty());
  }
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Main Window',
      click: () => {
        if (isInDesktopMode) {
          toggleDesktopWidgets(); // Switch back to main window
        } else {
          // Hide overlay if it's showing
          if (desktopOverlay && !desktopOverlay.isDestroyed()) {
            desktopOverlay.hide();
          }
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          } else {
            createMainWindow();
          }
        }
      },
    },
    {
      label: 'Toggle Desktop Widgets',
      click: toggleDesktopWidgets,
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Ambient Academic Compass');
}

// IPC Handlers
ipcMain.handle('toggle-desktop-widgets', toggleDesktopWidgets);

ipcMain.handle('update-desktop-colors', (event, colors) => {
  if (desktopOverlay && !desktopOverlay.isDestroyed()) {
    desktopOverlay.webContents.send('update-colors', colors);
  }
});

ipcMain.on("overlay-accept-events", (event, accept) => {
  if (desktopOverlay && !desktopOverlay.isDestroyed()) {
    try {
      if (accept) {
        desktopOverlay.setIgnoreMouseEvents(false); // stop passing through
      } else {
        desktopOverlay.setIgnoreMouseEvents(true, { forward: true }); // resume passthrough
      }
    } catch (err) {
      console.error("Failed to set overlay ignoreMouseEvents:", err);
    }
  }
});

// Handle desktop settings updates (widgets/progress bar enable/disable)
ipcMain.handle('update-desktop-settings', async (event, settings) => {
  if (desktopOverlay && !desktopOverlay.isDestroyed()) {
    desktopOverlay.webContents.send('update-settings', settings);
  }
  return true;
});

// App Event Handlers
app.whenReady().then(() => {
  createMainWindow();
  createSystemTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0 && !isInDesktopMode) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !isInDesktopMode) {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (ambientVisibilityTimer) {
    clearInterval(ambientVisibilityTimer);
    ambientVisibilityTimer = null;
  }
});
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

  // Make it truly ambient across all workspaces and apps
  desktopOverlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  desktopOverlay.setAlwaysOnTop(true, 'screen-saver', 1);
  // Show overlay
  desktopOverlay.setIgnoreMouseEvents(true, { forward: true });
  
  // Additional macOS-specific settings for maximum ambient visibility
  if (process.platform === 'darwin') {
    try {
      // Use newer method for better workspace persistence
      desktopOverlay.setWindowLevel && desktopOverlay.setWindowLevel('screen-saver');
      // Ensure it appears on all workspaces and full-screen apps
      desktopOverlay.setFullScreenable(false);
      desktopOverlay.setVisibleOnAllWorkspaces(true, { 
        visibleOnFullScreen: true,
        skipTransformProcessType: true 
      });
    } catch (e) {
      // setWindowLevel might not be available
    }
    // Ensure it doesn't interfere with other windows
    //desktopOverlay.setIgnoreMouseEvents(false);
  }

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
        desktopOverlay.setAlwaysOnTop(true, 'screen-saver', 1);
      }
      desktopOverlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    } catch (e) {
      console.log('Error enforcing ambient visibility:', e);
    }
  }
}

function toggleDesktopWidgets() {
  if (isInDesktopMode) {
    // Exit desktop mode - close overlay and show main window
    isInDesktopMode = false;
    if (ambientVisibilityTimer) {
      clearInterval(ambientVisibilityTimer);
      ambientVisibilityTimer = null;
    }
    if (desktopOverlay) {
      desktopOverlay.close();
      desktopOverlay = null;
    }
    if (!mainWindow) {
      createMainWindow();
    } else {
      mainWindow.show();
    }
  } else {
    // Enter desktop mode - close main window and show overlay
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
  // Create a simple tray menu
  try {
    tray = new Tray(path.join(__dirname, '../public/favicon.ico'));
  } catch (e) {
    // If favicon doesn't exist, create without icon
    tray = new Tray(nativeImage.createEmpty());
  }
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Main Window',
      click: () => {
        if (isInDesktopMode) {
          toggleDesktopWidgets(); // Switch back to main window
        } else if (mainWindow) {
          mainWindow.show();
        } else {
          createMainWindow();
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
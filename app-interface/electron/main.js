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

  mainWindow.on('focus', () => {
    if (desktopOverlay && !desktopOverlay.isDestroyed()) {
      desktopOverlay.close();
      desktopOverlay = null;
    }

    isInDesktopMode = false;

    if (ambientVisibilityTimer) {
      clearInterval(ambientVisibilityTimer);
      ambientVisibilityTimer = null;
    }
  });

  return mainWindow;
}

function createDesktopOverlay() {
  const displays = screen.getAllDisplays();
  const primaryDisplay = displays[0];
  const { width: screenWidth, height: screenHeight } = primaryDisplay.bounds;
  const widgetsEnabled = mainWindow.webContents.executeJavaScript(
    `localStorage.getItem('widgetsEnabled') !== null ? JSON.parse(localStorage.getItem('widgetsEnabled')) : true`
  );
  const progressBarEnabled = mainWindow.webContents.executeJavaScript(
    `localStorage.getItem('progressBarEnabled') !== null ? JSON.parse(localStorage.getItem('progressBarEnabled')) : true`
  );
  const progressBarColorIndex = mainWindow.webContents.executeJavaScript(
    `localStorage.getItem('progressBarColorIndex') !== null ? localStorage.getItem('progressBarColorIndex') : '0'`
  );

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
    focusable: false,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  desktopOverlay.loadFile(
    path.join(__dirname, '../public/desktop/desktop-sync.html')
  );

  desktopOverlay.webContents.on('did-finish-load', async () => {
    const widgets = await widgetsEnabled;
    const progressBar = await progressBarEnabled;
    const colorIndex = await progressBarColorIndex;
    console.log(`[DesktopOverlay] Overlay loaded with settings: widgetsEnabled=${widgets}, progressBarEnabled=${progressBar}, progressBarColorIndex=${colorIndex}`);
    
    const PROGRESS_BAR_COLORS = [
      { color: '#ffffff', border: '#333333' }, { color: '#e5e5e5', border: '#999999' },
      { color: '#FFF9C4', border: '#ccca9d' }, { color: '#FFCCBC', border: '#cca295' },
      { color: '#C8E6C9', border: '#a1b8a2' }, { color: '#BBDEFB', border: '#95b1cb' },
      { color: '#F8BBD0', border: '#c995a6' }, { color: '#E1BEE7', border: '#b598ba' },
      { color: '#0066ff', border: '#004499' }, { color: '#00ff66', border: '#00cc52' },
      { color: '#ffb6c1', border: '#cc9199' }, { color: '#9892ff', border: '#7b75cc' },
      { color: '#00ffff', border: '#00cccc' }, { color: '#ccff00', border: '#a6cc00' },
      { color: '#ff00ff', border: '#cc00cc' }, { color: '#ffff00', border: '#cccc00' },
      { color: '#4169e1', border: '#2854b4' }, { color: '#228b22', border: '#1b6b1b' },
      { color: '#87ceeb', border: '#6ba6cd' }, { color: '#98fb98', border: '#7bc97b' },
      { color: '#dda0dd', border: '#b87db8' }, { color: '#F3B1D1', border: '#cc5d97' },
      { color: '#BDBDBD', border: '#a1a1a1' }, { color: '#6FCF97', border: '#5baa52' },
      { color: '#B298F5', border: '#8b6dc9' }, { color: '#9AD1E3', border: '#3aa6b0' },
      { color: '#c0c0c0', border: '#999999' }, { color: '#ffd700', border: '#ccac00' },
      { color: '#ffa500', border: '#cc8400' }, { color: '#40e0d0', border: '#33b3a6' },
      { color: '#8a2be2', border: '#6b22b5' }, { color: '#00ff7f', border: '#00cc66' },
      { color: '#00bfff', border: '#0099cc' }, { color: '#ba55d3', border: '#9444a6' },
      { color: '#7fffd4', border: '#66cca7' }, { color: '#8a2be2', border: '#6b22b5' },
      { color: '#7fff00', border: '#66cc00' }
    ];
    let color = { color: '#ffffff', border: '#333333' }; // default
    const idx = parseInt(colorIndex, 10);
    if (idx >= 0 && idx < PROGRESS_BAR_COLORS.length) {
      color = PROGRESS_BAR_COLORS[idx];
    }

    desktopOverlay.webContents.send('update-settings', {
      widgetsEnabled: widgets,
      progressBarEnabled: progressBar,
      progressBarColor: color.color,
      progressBarBorder: color.border
    });
  });

  desktopOverlay.setBackgroundColor('#00000000');

  // Configure for all workspaces BEFORE showing
  if (process.platform === 'darwin') {
    // macOS-specific: Apply all settings before showing
    desktopOverlay.setFullScreenable(false);
    desktopOverlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    // Use 'floating' level to keep it above normal windows but below modals
    desktopOverlay.setAlwaysOnTop(true, 'screen-saver', 1);
  } else {
    // Other platforms
    desktopOverlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    desktopOverlay.setAlwaysOnTop(true, 'screen-saver', 1);
  }
  
  desktopOverlay.setIgnoreMouseEvents(true, { forward: true });
  
  // Show the overlay after all settings are configured
  desktopOverlay.show();

  // Prevent closing/minimizing from breaking desktop mode
  desktopOverlay.on('hide', () => {
    if (isInDesktopMode) desktopOverlay.show();
  });
  desktopOverlay.on('minimize', () => {
    if (isInDesktopMode) desktopOverlay.restore();
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
    // Exit desktop mode - show main window and hide overlay
    isInDesktopMode = false;
    if (ambientVisibilityTimer) {
      clearInterval(ambientVisibilityTimer);
      ambientVisibilityTimer = null;
    }
    // Hide the overlay when showing main window
    if (desktopOverlay) {
      desktopOverlay.close();
      desktopOverlay = null;

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
      mainWindow.minimize();
    }
    createDesktopOverlay();
    
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
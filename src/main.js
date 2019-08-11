// Modules to control application life and create native browser window
const { app, BrowserWindow, webFrame, session } = require("electron");
const path = require("path");

// DevTools and refresh
require("electron-debug")();
// Auto reload
require("electron-reload")(__dirname + "\\src");

const { autoUpdater } = require("electron-updater");
autoUpdater.checkForUpdatesAndNotify();

const isFirstRun = require("electron-first-run")();

app.on("browser-window-created", function(e, window) {
  window.setMenu(null);
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  session.defaultSession.on("will-download", onDownload);
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 950,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    webPreferences: {
      navigateOnDragDrop: false,
      defaultFontFamily: '"Segoe UI", sans-serif',
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

function onDownload(event, item, webContents) {
  // Prevent from downloading pdf file.
  if (
    item.getMimeType() == "application/pdf" &&
    item.getURL().indexOf("blob:file:") != 0
  ) {
    event.preventDefault();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const ipcMain = require("electron").ipcMain;

ipcMain.on("setOnTop", (_, val) => {
  mainWindow.setAlwaysOnTop(val, "screen-saver", 0);
});

ipcMain.on("getIsFirstRun", e => {
  e.returnValue = isFirstRun;
});

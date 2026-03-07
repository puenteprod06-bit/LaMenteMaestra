const { app, BrowserWindow } = require('electron')
const { autoUpdater } = require('electron-updater')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800
  })

  win.loadFile("index.html")
}

app.whenReady().then(() => {
  createWindow()

  autoUpdater.checkForUpdatesAndNotify()
})

autoUpdater.on("update-available", () => {
  console.log("Actualización disponible")
})

autoUpdater.on("update-downloaded", () => {
  autoUpdater.quitAndInstall()
})
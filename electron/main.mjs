import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { registerDialogHandlers } from './ipc/dialogHandlers.mjs'
import { registerFileHandlers, initializeData } from './ipc/fileHandlers.mjs'
import { registerConfigHandlers } from './ipc/configHandlers.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getPreloadPath() {
  return path.join(__dirname, 'preload.cjs')
}

function getIndexHtmlUrl() {
  return pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).toString()
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.once('ready-to-show', () => win.show())

  const devServerUrl = process.env.VITE_DEV_SERVER_URL
  if (devServerUrl) {
    win.loadURL(devServerUrl)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadURL(getIndexHtmlUrl())
  }

  return win
}

function registerAppHandlers() {
  ipcMain.handle('get-app-path', () => app.getAppPath())
  ipcMain.handle('get-user-data-path', () => app.getPath('userData'))
  ipcMain.handle('get-default-data-file-path', () =>
    path.join(app.getPath('userData'), 'data.json'),
  )
}

app.whenReady().then(async () => {
  // 初始化数据目录
  await initializeData()

  registerFileHandlers()
  registerDialogHandlers()
  registerConfigHandlers()
  registerAppHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


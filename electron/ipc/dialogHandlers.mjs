import { dialog, ipcMain } from 'electron'

export function registerDialogHandlers() {
  ipcMain.handle('show-open-dialog', async (_event, options) => {
    const result = await dialog.showOpenDialog(options)
    return result
  })

  ipcMain.handle('show-save-dialog', async (_event, options) => {
    const result = await dialog.showSaveDialog(options)
    return result
  })
}


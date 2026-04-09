import { ipcMain } from 'electron'
import { getSettings, updateSettings } from '../config/store.mjs'

export function registerConfigHandlers() {
  // 获取应用设置
  ipcMain.handle('get-settings', () => {
    return getSettings()
  })

  // 更新应用设置
  ipcMain.handle('update-settings', (event, settings) => {
    updateSettings(settings)
    return { success: true }
  })
}

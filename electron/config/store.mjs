import Store from 'electron-store'

// 创建配置存储实例
const store = new Store({
  name: 'app-config',
  defaults: {
    // 应用设置
    settings: {
      autoSave: true,
      lastExportPath: '',
      lastImportPath: '',
    }
  }
})

// 获取应用设置
export function getSettings() {
  return store.get('settings')
}

// 更新应用设置
export function updateSettings(settings) {
  store.set('settings', { ...getSettings(), ...settings })
}

export default store

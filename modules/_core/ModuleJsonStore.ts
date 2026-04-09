type ElectronApi = NonNullable<Window['electronAPI']>

function hasElectronApi(api: Window['electronAPI']): api is ElectronApi {
  return !!api?.getUserDataPath && !!api?.readFile && !!api?.writeFile
}

// 将 key 映射到数据文件路径
// 例如: 'pages/home' -> 'modules/pages/home.json'
function keyToDataFilePath(key: string): string {
  return `modules/${key}.json`
}

export class ModuleJsonStore<T> {
  readonly key: string
  readonly defaultData: T

  constructor(opts: { key: string; defaultData: T }) {
    this.key = opts.key
    this.defaultData = opts.defaultData
  }

  private storageKey() {
    return `module-json:${this.key}`
  }

  // 获取数据文件路径（使用与 fileHandlers.mjs 相同的格式）
  private getDataFilePath(): string {
    return keyToDataFilePath(this.key)
  }

  async read(): Promise<T> {
    // Electron: read from userData override if exists, else fallback
    if (hasElectronApi(window.electronAPI)) {
      try {
        const filePath = this.getDataFilePath()
        const raw = await window.electronAPI.readFile(filePath)
        return JSON.parse(raw) as T
      } catch {
        return this.defaultData
      }
    }

    // Browser fallback: localStorage override
    try {
      const raw = globalThis.localStorage?.getItem(this.storageKey())
      if (!raw) return this.defaultData
      return JSON.parse(raw) as T
    } catch {
      return this.defaultData
    }
  }

  async write(next: T): Promise<void> {
    const raw = JSON.stringify(next, null, 2)

    if (hasElectronApi(window.electronAPI)) {
      const filePath = this.getDataFilePath()
      await window.electronAPI.writeFile(filePath, raw)
      return
    }

    globalThis.localStorage?.setItem(this.storageKey(), raw)
  }
}

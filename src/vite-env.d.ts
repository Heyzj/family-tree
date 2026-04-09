/// <reference types="vite/client" />

export {}

interface DialogResult {
  canceled: boolean
  filePath?: string
  filePaths?: string[]
}

declare global {
  interface Window {
    electronAPI?: {
      // File I/O
      readFile: (filePath: string) => Promise<string>
      writeFile: (filePath: string, data: string) => Promise<boolean>

      // Dialogs
      showOpenDialog: (options: unknown) => Promise<DialogResult>
      showSaveDialog: (options: unknown) => Promise<DialogResult>

      // App paths
      getAppPath: () => Promise<string>
      getUserDataPath: () => Promise<string>
      getDefaultDataFilePath: () => Promise<string>

      // Config (应用设置)
      getSettings: () => Promise<{
        autoSave: boolean
        lastExportPath: string
        lastImportPath: string
      }>
      updateSettings: (settings: object) => Promise<{ success: boolean }>
    }
  }
}

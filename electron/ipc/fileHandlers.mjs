import { ipcMain } from 'electron'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { app } from 'electron'

const userDataPath = app.getPath('userData')
const defaultDataDir = path.join(userDataPath, 'data')

// 数据文件映射（从打包后的资源复制）
const defaultDataFiles = {
  'home.json': 'modules/pages/home.json',
  'family.json': 'modules/pages/family.json',
  'navigation.json': 'modules/pages/navigation.json'
}

// 检查路径是否是数据文件
function isDataFilePath(filePath) {
  return filePath.includes('modules/pages/') && 
    (filePath.endsWith('home.json') || 
     filePath.endsWith('family.json') || 
     filePath.endsWith('navigation.json'))
}

// 将任意路径转换为数据文件名
function getDataFileName(filePath) {
  if (filePath.endsWith('home.json')) return 'home.json'
  if (filePath.endsWith('family.json')) return 'family.json'
  if (filePath.endsWith('navigation.json')) return 'navigation.json'
  return null
}

// 获取数据文件的完整路径
function getDataFilePath(filename) {
  return path.join(defaultDataDir, filename)
}

// 在指定目录初始化数据文件
export async function initializeDataInDirectory(targetDir) {
  try {
    // 创建数据目录
    await fs.mkdir(targetDir, { recursive: true })
    
    // 检查并复制默认数据文件
    for (const [filename, sourcePath] of Object.entries(defaultDataFiles)) {
      const targetPath = path.join(targetDir, filename)
      
      try {
        await fs.access(targetPath)
        // 文件已存在，跳过
      } catch {
        // 文件不存在，从应用目录复制
        const appPath = app.getAppPath()
        const fullSourcePath = path.join(appPath, sourcePath)
        
        try {
          const data = await fs.readFile(fullSourcePath, 'utf-8')
          await fs.writeFile(targetPath, data, 'utf-8')
          console.log(`已初始化数据文件: ${filename}`)
        } catch (err) {
          console.error(`复制 ${filename} 失败:`, err.message)
        }
      }
    }
    
    console.log('数据目录:', targetDir)
    return true
  } catch (err) {
    console.error('初始化数据失败:', err)
    throw err
  }
}

// 确保数据目录存在并初始化默认数据
export async function initializeData() {
  return initializeDataInDirectory(defaultDataDir)
}

export function registerFileHandlers() {
  ipcMain.handle('read-file', async (_event, filePath) => {
    // 如果是数据文件，重定向到用户数据目录
    if (isDataFilePath(filePath)) {
      const filename = getDataFileName(filePath)
      if (filename) {
        const dataPath = getDataFilePath(filename)
        try {
          const data = await fs.readFile(dataPath, 'utf-8')
          return data
        } catch (err) {
          // 如果文件不存在，尝试从默认位置复制
          const appPath = app.getAppPath()
          const sourcePath = path.join(appPath, defaultDataFiles[filename])
          try {
            const data = await fs.readFile(sourcePath, 'utf-8')
            await fs.writeFile(dataPath, data, 'utf-8')
            return data
          } catch (copyErr) {
            throw new Error(`读取数据文件失败: ${err.message}`)
          }
        }
      }
    }
    
    // 普通文件读取
    const data = await fs.readFile(filePath, 'utf-8')
    return data
  })

  ipcMain.handle('write-file', async (_event, filePath, data) => {
    // 如果是数据文件，重定向到用户数据目录
    if (isDataFilePath(filePath)) {
      const filename = getDataFileName(filePath)
      if (filename) {
        const dataPath = getDataFilePath(filename)
        await fs.writeFile(dataPath, data, 'utf-8')
        return true
      }
    }
    
    // 普通文件写入
    await fs.writeFile(filePath, data, 'utf-8')
    return true
  })
}

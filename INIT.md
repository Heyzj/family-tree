# 族谱管理系统 - 项目初始化指南

## 快速开始

### 方式一：使用 Vite 快速创建（推荐）

```bash
# 1. 进入项目目录
cd /Users/code/

# 2. 使用 Vite 创建 React + TypeScript 项目
yarn create vite@latest family-tree -- --template react-ts

# 3. 进入项目目录
cd family-tree

# 4. 安装依赖
yarn install

# 5. 安装 Electron 相关依赖
yarn add electron electron-store electron-log
yarn add -D electron-builder concurrently wait-on

# 6. 安装业务依赖
yarn add react-router-dom zustand zod gojs dayjs uuid

# 7. 安装类型定义
yarn add -D @types/node @types/uuid
```

### 方式二：手动创建（完整控制）

```bash
# 1. 创建项目目录
mkdir family-tree && cd family-tree

# 2. 初始化 yarn 项目
yarn init -y

# 3. 安装核心依赖
yarn add react@18 react-dom@18 react-router-dom@6 zustand zod gojs dayjs uuid electron-store electron-log

# 4. 安装开发依赖
yarn add -D vite@5 @vitejs/plugin-react typescript @types/react @types/react-dom @types/node @types/uuid electron electron-builder concurrently wait-on
```

---

## 项目初始化命令汇总

```bash
# 完整命令（复制粘贴执行）
cd /Users/code/
mkdir family-tree
cd family-tree
yarn create vite@latest . -- --template react-ts --force
yarn install
yarn add react-router-dom zustand zod gojs dayjs uuid electron-store electron-log
yarn add -D electron-builder concurrently wait-on @types/node @types/uuid
```

---

## 初始化后操作

### 1. 配置 Vite (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
})
```

### 2. 配置 TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. 创建 Electron 主进程文件

```bash
mkdir -p electron
```

### 4. 配置 electron-builder (electron-builder.json5)

```json
{
  "$schema": "https://raw.githubusercontent.com/electron-userland/electron-builder/master/packages/app-builder-lib/scheme.json",
  "appId": "com.genealogy.system",
  "productName": "族谱管理系统",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "electron/**/*"
  ],
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      }
    ],
    "icon": "public/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeaddationDirectory": true
  },
  "mac": {
    "target": ["dmg"],
    "icon": "public/icon.icns"
  },
  "linux": {
    "target": ["AppImage"],
    "icon": "public/icon.png"
  }
}
```

---

## 目录结构初始化

```bash
# 创建目录结构
mkdir -p src/{assets,components/{common,FamilyTree,MemberForm,MemberCard,RelationModal},hooks,pages/{Home,DataEntry,MemberList,Settings},store,types,utils}
mkdir -p electron/ipc
mkdir -p public
```

---

## 验证项目运行

```bash
# 启动开发服务器
yarn run dev

# 如果需要构建
yarn run build
```

---

## 下一步

1. 阅读 `SPEC.md` 了解完整需求
2. 按 Phase 1 开始项目初始化
3. 参考技术文档搭建 Electron 集成
4. 开始核心功能开发

---

*初始化时间：2025-01-20*

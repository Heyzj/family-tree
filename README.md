# 族谱管理系统

一个基于 Electron + React + TypeScript 开发的跨平台族谱管理应用。支持家族成员管理、家族树可视化、家族历史记录、先贤风采展示等功能。

## 功能特性

- **家族树可视化** - 使用 GoJS 实现交互式家族树图谱，支持拖拽、缩放、点击查看详情
- **成员管理** - 完整的 CRUD 操作，支持上传头像、编辑个人信息、设置亲属关系
- **家族渊源** - 记录家族历史、起源故事、传承文化
- **先贤风采** - 展示家族杰出人物的事迹、成就、影像资料
- **家族纪事** - 记录家族重要事件、聚会、里程碑
- **数据配置** - 灵活的数据导入导出，支持 JSON 格式，方便备份和迁移
- **跨平台支持** - 支持 macOS、Windows、Linux

## 技术栈

- **前端框架**: React 18 + TypeScript
- **桌面框架**: Electron
- **构建工具**: Vite
- **UI 组件**: Ant Design + Tailwind CSS
- **图表库**: GoJS（家族树可视化）
- **富文本编辑**: Quill
- **状态管理**: Zustand
- **数据验证**: Zod

## 开发环境要求

- Node.js 18+
- Yarn 或 npm
- macOS / Windows / Linux

## 安装与运行

### 1. 克隆仓库

```bash
git clone https://github.com/Heyzj/family-tree.git
cd family-tree
```

### 2. 安装依赖

```bash
yarn install
# 或
npm install
```

### 3. 开发模式运行

```bash
# 同时启动 Vite 开发服务器和 Electron
yarn dev

# 或分别启动
yarn dev:vite      # 仅启动 Vite 开发服务器
yarn dev:electron  # 仅启动 Electron（需先启动 Vite）
```

### 4. 构建生产版本

```bash
# 构建前端资源
yarn build

# 打包 Electron 应用（全平台）
yarn build:electron

# 仅打包 macOS ARM64 版本（M1/M2/M3）
yarn build:electron:mac-arm64

# 仅打包 Windows 版本
yarn build:electron:win

# 仅打包 Linux 版本
yarn build:electron:linux
```

## 打包输出

打包完成后，文件位于 `release/` 目录：

### macOS
- `mac-arm64/族谱管理系统.app` - 直接运行
- `族谱管理系统-1.0.0-arm64.dmg` - 安装包

### Windows
- `win-unpacked/族谱管理系统.exe` - 免安装版
- `族谱管理系统 Setup 1.0.0.exe` - 安装程序

### Linux
- `linux-unpacked/` - 免安装版
- `族谱管理系统-1.0.0.AppImage` - 通用运行包
- `族谱管理系统_1.0.0_amd64.deb` - Debian/Ubuntu 安装包

## 项目结构

```
family-tree/
├── electron/               # Electron 主进程代码
│   ├── main.mjs           # 主入口
│   ├── preload.cjs        # 预加载脚本
│   ├── ipc/               # IPC 通信处理
│   └── config/            # 配置文件
├── src/                    # 前端源码
│   ├── components/        # 组件
│   ├── pages/             # 页面
│   ├── types/             # TypeScript 类型
│   ├── assets/            # 静态资源
│   └── App.tsx            # 应用入口
├── modules/                # 数据模块
│   └── pages/             # 页面数据配置
├── build/                  # 构建资源（图标等）
├── release/                # 打包输出（gitignore）
├── dist/                   # 构建输出（gitignore）
└── package.json
```

## 数据存储

应用数据存储在 Electron 的 `userData` 目录：

- **macOS**: `~/Library/Application Support/族谱管理系统/`
- **Windows**: `%APPDATA%/族谱管理系统/`
- **Linux**: `~/.config/族谱管理系统/`

数据文件包括：
- `data.json` - 家族成员数据
- `home.json` - 首页配置
- `config.json` - 应用设置

## 开发指南

### 代码规范

```bash
# 运行 ESLint 检查
yarn lint
```

### 生成应用图标

```bash
node scripts/generate-icons.mjs
```

需要准备 `build/icon.png`（1024x1024）作为源文件。

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)

## 致谢

- [React](https://react.dev/)
- [Electron](https://www.electronjs.org/)
- [Vite](https://vitejs.dev/)
- [Ant Design](https://ant.design/)
- [GoJS](https://gojs.net/)

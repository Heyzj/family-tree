# 族谱管理系统 - 技术开发文档

## 一、项目概述

### 1.1 项目背景
开发一款本地化的族谱管理桌面应用程序，帮助用户记录、管理和可视化展示家族谱系关系。数据存储在本地，无需网络依赖，支持数据导出导入。

### 1.2 核心功能
- **成员信息管理**：录入、编辑、删除家族成员信息
- **关系建立**：建立家族成员之间的关系（父子、配偶等）
- **族谱可视化**：以树状图形式展示整个家族谱系
- **数据持久化**：本地 JSON 文件存储
- **导入导出**：支持 JSON 格式的数据导入导出

---

## 二、技术栈选型

### 2.1 前端框架
| 技术 | 版本 | 说明 |
|------|------|------|
| **Vite** | ^5.x | 下一代前端构建工具，快速热更新 |
| **React** | ^18.x | UI 框架，组件化开发 |
| **TypeScript** | ^5.x | 类型安全，提升代码质量 |

### 2.2 桌面打包
| 技术 | 版本 | 说明 |
|------|------|------|
| **Electron** | ^28.x | 跨平台桌面应用框架 |
| **electron-builder** | ^24.x | 应用打包发布工具 |

### 2.3 族谱可视化
| 技术 | 说明 |
|------|------|
| **GoJS** | 专业的图表库，族谱树状图首选，文档完善 |
| **D3.js** | 更灵活但开发成本更高 |

> **推荐选择 GoJS**，原因：
> - 内置树状图布局，开箱即用
> - 支持节点拖拽、缩放、导出图片
> - 官方有族谱示例，上手快

### 2.4 UI 组件库
| 技术 | 说明 |
|------|------|
| **Ant Design** | 企业级 UI，功能完善 |
| **Chakra UI** | 更现代，样式灵活 |
| **Tailwind CSS** | 原子化 CSS，自由度高 |

> **推荐选择 Ant Design**，与 Electron 桌面场景契合度高。

### 2.5 状态管理
| 技术 | 说明 |
|------|------|
| **Zustand** | 轻量级状态管理 |
| **Redux Toolkit** | 功能全面，生态成熟 |

> **推荐选择 Zustand**，简单够用。

### 2.6 数据存储
- **electron-store**：轻量级 JSON 文件存储
- **本地 JSON 文件**：直接读写 JSON 文件

---

## 三、项目结构

```
family-tree/
├── electron/                    # Electron 主进程
│   ├── main.ts                  # 主进程入口
│   ├── preload.ts               # 预加载脚本（桥接）
│   └── ipc/                     # IPC 通信处理
│       ├── fileHandlers.ts      # 文件读写
│       └── dialogHandlers.ts    # 系统对话框
├── src/                         # React 渲染进程
│   ├── assets/                  # 静态资源
│   │   ├── images/              # 图片资源
│   │   └── styles/              # 全局样式
│   ├── components/              # 公共组件
│   │   ├── FamilyTree/          # 族谱树组件
│   │   ├── MemberForm/          # 成员表单组件
│   │   ├── MemberCard/          # 成员卡片组件
│   │   ├── RelationModal/       # 关系编辑弹窗
│   │   └── common/              # 通用组件（按钮、输入框等）
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── useFamily.ts         # 家族数据操作
│   │   ├── useTreeLayout.ts     # 树状图布局
│   │   └── useImportExport.ts   # 导入导出
│   ├── pages/                   # 页面组件
│   │   ├── Home/                # 首页 - 族谱展示
│   │   ├── DataEntry/           # 数据录入页
│   │   ├── MemberList/          # 成员列表页
│   │   └── Settings/            # 设置页
│   ├── store/                   # 状态管理
│   │   └── familyStore.ts       # 家族数据 Store
│   ├── types/                   # TypeScript 类型定义
│   │   ├── family.ts            # 家族相关类型
│   │   └── index.ts             # 索引文件
│   ├── utils/                   # 工具函数
│   │   ├── familyTree.ts        # 族谱树构建
│   │   ├── validators.ts       # 数据校验
│   │   └── fileUtils.ts        # 文件操作
│   ├── App.tsx                  # 根组件
│   ├── main.tsx                 # 渲染进程入口
│   └── vite-env.d.ts           # Vite 类型声明
├── package.json
├── vite.config.ts              # Vite 配置
├── electron-builder.json5       # 打包配置
├── tsconfig.json                # TypeScript 配置
└── README.md
```

---

## 四、数据模型设计

### 4.1 成员信息 (Member)

```typescript
interface Member {
  id: string;                    // 唯一标识 (UUID)
  name: string;                   // 姓名
  gender: 'male' | 'female';      // 性别
  birthDate?: string;             // 出生日期 (YYYY-MM-DD)
  deathDate?: string;            // 去世日期 (可选)
  generation?: number;           // 代数（字辈）
  generationName?: string;       // 字辈名称
  avatar?: string;               // 头像 Base64 或文件路径
  bio?: string;                  // 个人简介
  spouseId?: string;             // 配偶 ID
  fatherId?: string;             // 父亲 ID
  motherId?: string;             // 母亲 ID
  childrenIds: string[];        // 子女 ID 列表
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}
```

### 4.2 家族数据 (FamilyData)

```typescript
interface FamilyData {
  version: string;                // 数据版本号
  lastModified: string;          // 最后修改时间
  familyName: string;            // 家族姓氏
  rootMemberId?: string;          // 族谱根节点 ID（最早祖先）
  members: Member[];              // 所有成员列表
}
```

### 4.3 数据验证 Schema

```typescript
const MemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, '姓名不能为空').max(50),
  gender: z.enum(['male', 'female']),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  generation: z.number().int().min(1).optional(),
  generationName: z.string().max(20).optional(),
  avatar: z.string().optional(),
  bio: z.string().max(1000).optional(),
  spouseId: z.string().uuid().nullable().optional(),
  fatherId: z.string().uuid().nullable().optional(),
  motherId: z.string().uuid().nullable().optional(),
  childrenIds: z.array(z.string().uuid()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
```

---

## 五、页面规划

### 5.1 首页 - 族谱展示 (`/`)

**功能描述**：
- 全屏展示家族谱系树状图
- 支持缩放、拖拽、居中
- 点击节点查看成员详情
- 支持导出族谱图为图片

**核心组件**：
- `FamilyTree`：GoJS 树状图组件
- `TreeToolbar`：工具栏（缩放、重置、导出）
- `MemberDetailPanel`：右侧成员详情面板

**交互流程**：
```
用户进入首页
    ↓
加载本地 JSON 数据
    ↓
渲染族谱树（从 rootMemberId 开始递归）
    ↓
用户可进行以下操作：
├── 点击节点 → 展开/收起子树
├── 双击节点 → 打开成员详情面板
├── 拖拽画布 → 平移视图
├── 滚轮 → 缩放视图
├── 工具栏按钮 → 导出图片/重置视图
```

### 5.2 数据录入页 (`/entry`)

**功能描述**：
- 录入新成员信息
- 建立成员关系
- 上传成员照片

**表单字段**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 姓名 | TextInput | 是 | - |
| 性别 | Radio/Switch | 是 | 男/女 |
| 出生日期 | DatePicker | 否 | - |
| 去世日期 | DatePicker | 否 | - |
| 字辈 | TextInput | 否 | 如"德、维、启" |
| 代数 | Number | 否 | 第几代 |
| 照片 | ImagePicker | 否 | 支持裁剪 |
| 简介 | TextArea | 否 | 个人介绍 |
| 父亲 | Select | 否 | 从现有成员中选择 |
| 母亲 | Select | 否 | 从现有成员中选择 |
| 配偶 | Select | 否 | 从现有成员中选择 |

**交互流程**：
```
点击"新增成员"
    ↓
打开录入表单 Modal
    ↓
填写基本信息
    ↓
选择关系（父亲/母亲/配偶）
    ↓
上传照片（可选）
    ↓
点击保存 → 写入本地 JSON
    ↓
返回族谱页自动刷新
```

### 5.3 成员列表页 (`/members`)

**功能描述**：
- 表格形式展示所有成员
- 支持搜索、筛选、排序
- 批量操作（删除、导出选中）

**功能列表**：
- 搜索（姓名、字辈）
- 筛选（性别、代数）
- 排序（姓名、出生日期、代数）
- 编辑成员
- 删除成员（确认对话框）
- 查看详情

### 5.4 数据管理页 (`/data`)

**功能描述**：
- 导入 JSON 数据
- 导出 JSON 数据
- 数据备份历史
- 清空数据（危险操作，需二次确认）

**功能列表**：
| 功能 | 按钮样式 | 说明 |
|------|---------|------|
| 导入数据 | Primary | 选择 JSON 文件覆盖当前数据 |
| 导出数据 | Primary | 下载完整 JSON 文件 |
| 另存为 | Secondary | 另存为新文件 |
| 清空数据 | Danger | 危险操作，需输入"确认" |

**JSON 文件格式**：
```json
{
  "version": "1.0.0",
  "lastModified": "2025-01-20T10:30:00Z",
  "familyName": "张氏",
  "rootMemberId": "uuid-xxx",
  "members": [
    {
      "id": "uuid-xxx",
      "name": "张一大",
      "gender": "male",
      "birthDate": "1950-01-01",
      "generation": 1,
      "generationName": "一",
      "childrenIds": ["uuid-yyy", "uuid-zzz"],
      "createdAt": "2025-01-20T10:30:00Z",
      "updatedAt": "2025-01-20T10:30:00Z"
    }
  ]
}
```

### 5.5 设置页 (`/settings`)

**功能描述**：
- 家族姓氏设置
- 应用主题（亮色/暗色）
- 数据存储路径
- 关于信息

---

## 六、Electron 集成方案

### 6.1 主进程职责
- 窗口管理
- 文件系统操作（读/写 JSON）
- 系统对话框（打开文件、保存文件）
- 应用菜单

### 6.2 IPC 通信设计

```typescript
// preload.ts - 暴露安全的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, data: string) => ipcRenderer.invoke('write-file', filePath, data),

  // 对话框
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),

  // 应用信息
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
});
```

### 6.3 数据存储路径
```
Windows: %APPDATA%/family-tree/data.json
macOS: ~/Library/Application Support/family-tree/data.json
Linux: ~/.config/family-tree/data.json
```

---

## 七、GoJS 族谱图实现要点

### 7.1 树形布局配置

```typescript
const treeLayout = new go.TreeLayout({
  angle: 90,                    // 横向树（从上往下）
  layerSpacing: 50,
  nodeSpacing: 20,
  setsPortSpot: true,
  setsChildPortSpot: true,
});

// 族谱特殊配置：子女均匀分布在父节点下方
treeLayout.aggressive = false; // 防止节点重叠
```

### 7.2 节点模板设计

```
┌─────────────────────┐
│      [照片]         │  ← 圆形头像
│      张三           │  ← 姓名
│    1950年生         │  ← 出生年份
│    【德】字辈        │  ← 字辈标签
└─────────────────────┘
         │
    ─────┴─────
```

### 7.3 关系线样式
- 父子关系：实线
- 配偶关系：虚线（横向连接）

---

## 八、开发步骤规划

### Phase 1：项目初始化（第 1 天）
1. 初始化 Vite + React + TS 项目
2. 配置 Electron 集成
3. 配置 electron-builder 打包
4. 配置 ESLint + Prettier
5. 搭建基础项目结构

### Phase 2：数据层（第 2 天）
1. 定义 TypeScript 类型
2. 实现 electron-store 数据持久化
3. 实现 IPC 通信
4. 数据校验（Zod）

### Phase 3：首页族谱展示（第 3-4 天）
1. 集成 GoJS
2. 设计节点模板
3. 实现树形布局
4. 实现缩放、拖拽交互
5. 实现节点点击事件

### Phase 4：数据录入（第 5 天）
1. 实现成员表单组件
2. 实现照片上传功能
3. 实现关系选择器
4. 数据保存逻辑

### Phase 5：成员列表与数据管理（第 6 天）
1. 实现成员表格
2. 实现搜索、筛选
3. 实现导入导出 JSON
4. 实现清空数据

### Phase 6：打包与测试（第 7 天）
1. 完善错误处理
2. 测试各平台打包
3. 修复打包问题
4. 编写 README

---

## 九、依赖清单

### 9.1 生产依赖

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "gojs": "^2.3.x",
    "zustand": "^4.x",
    "zod": "^3.x",
    "electron-store": "^8.x",
    "electron-log": "^5.x",
    "dayjs": "^1.x",
    "uuid": "^9.x"
  }
}
```

### 9.2 开发依赖

```json
{
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x",
    "electron": "^28.x",
    "electron-builder": "^24.x",
    "electron-devtools-installer": "^3.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "@types/node": "^20.x",
    "@types/uuid": "^9.x",
    "@types/gojs": "^2.x",
    "eslint": "^8.x",
    "prettier": "^3.x"
  }
}
```

---

## 十、后续可扩展功能

1. **多人编辑**：接入 SQLite 数据库，支持多用户
2. **云同步**：接入后端 API，实现数据云端备份
3. **照片墙**：成员照片画廊
4. **族谱打印**：支持打印排版
5. **多语言**：国际化支持
6. **主题定制**：族谱样式皮肤
7. **事件记录**：记录家族重要事件（婚丧嫁娶）
8. **谱系报告**：自动生成 PDF 谱系报告

---

## 十一、参考资源

- [GoJS 官方文档](https://gojs.net.cn/latest/index.html)
- [GoJS 族谱示例](https://gojs.net.cn/samples/genogram.html)
- [Electron 官方文档](https://www.electronjs.org/docs)
- [Ant Design 组件库](https://ant.design/components/overview)
- [Vite 配置指南](https://vitejs.dev/config/)

---

*文档版本：v1.0.0*

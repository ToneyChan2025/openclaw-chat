# OpenClaw Chat 客户端

基于 Tauri + React + TypeScript 的桌面聊天应用。

## 功能特性

- 🚀 基于 Tauri 的轻量级桌面应用
- ⚡ 实时 WebSocket 通信
- 💬 支持 Markdown 渲染
- 📎 文件上传/下载
- 🎨 现代化的 UI 设计

## 开发环境要求

- Node.js 18+
- Rust 1.70+
- Windows 10/11

## 快速开始

### 1. 安装依赖

```bash
cd client
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
VITE_WS_URL=ws://your-server:8080/ws
VITE_API_URL=http://your-server:8080/api
```

### 3. 开发模式

```bash
# 启动前端开发服务器
npm run dev

# 启动 Tauri 开发模式（需要 Rust 环境）
npm run tauri:dev
```

### 4. 构建

```bash
# 构建生产版本
npm run tauri:build
```

构建后的可执行文件位于 `src-tauri/target/release/`。

## 项目结构

```
client/
├── src/
│   ├── components/     # React 组件
│   ├── hooks/          # 自定义 Hooks
│   ├── types/          # TypeScript 类型
│   ├── utils/          # 工具函数
│   ├── App.tsx         # 主应用组件
│   ├── main.tsx        # 入口文件
│   └── index.css       # 全局样式
├── src-tauri/          # Tauri 配置（待创建）
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 技术栈

- **框架**: Tauri v2 + React 18
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **构建**: Vite
- **Markdown**: react-markdown + remark-gfm

## 注意事项

1. 首次运行需要安装 Rust 工具链
2. 确保服务器端已启动并配置正确的环境变量
3. Windows 上可能需要安装 WebView2 运行时

## 许可证

MIT

# OpenClaw Chat 客户端

自用聊天软件，已配置服务器地址。

## 服务器配置

- **服务器地址**: `43.130.46.144:8080`
- **WebSocket**: `ws://43.130.46.144:8080/ws`
- **HTTP API**: `http://43.130.46.144:8080/api`

## 使用说明

1. 确保服务器端已启动
2. 直接运行 exe 文件即可连接

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

### 2. 开发模式

```bash
# 启动前端开发服务器
npm run dev

# 启动 Tauri 开发模式（需要 Rust 环境）
npm run tauri:dev
```

### 3. 构建

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
├── src-tauri/          # Tauri 配置
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

## 许可证

MIT

# OpenClaw Chat

自用聊天软件，对接云服务器上的 OpenClaw，支持实时聊天和文件传输。

## 项目状态

| 阶段 | 状态 | 说明 |
|------|------|------|
| Phase 1: 架构设计 | ✅ 完成 | 系统设计文档 |
| Phase 2: 服务器端 | ✅ 完成 | WebSocket + HTTP API |
| Phase 3: 客户端 | 🟡 进行中 | React 代码完成，待 Tauri 配置 |
| Phase 4: 集成测试 | ⏳ 待开始 | 端到端测试和打包 |

## 快速开始

### 服务器端

```bash
cd server
pnpm install
# 配置 .env 文件
cp .env.example .env
# 编辑 .env 设置 OPENCLAW_TOKEN
pnpm start
```

服务器将在 `http://localhost:8080` 启动。

### 客户端

**注意：客户端需要在 Windows 本地开发**

1. 确保已安装 Node.js 18+ 和 Rust 1.70+
2. 复制 `client/` 目录到本地
3. 安装依赖：`npm install`
4. 配置 `.env` 文件
5. 开发模式：`npm run tauri:dev`
6. 构建：`npm run tauri:build`

## 项目结构

```
openclaw-chat/
├── client/          # Tauri 客户端 (React + TypeScript)
├── server/          # Node.js 服务器
├── docs/            # 文档
└── README.md
```

## 技术栈

- **客户端**: Tauri v2 + React 18 + TypeScript + Tailwind CSS
- **服务器**: Node.js + Express + WebSocket (ws)
- **通信**: WebSocket + HTTP REST API

## 功能特性

- ✅ 实时 WebSocket 通信
- ✅ 心跳保活和自动重连
- ✅ 文件上传/下载
- ✅ OpenClaw AI 对接
- ✅ Markdown 消息渲染
- 🟡 桌面应用打包（待完成）

## 许可证

MIT

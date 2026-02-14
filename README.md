# OpenClaw Chat

自用聊天软件，对接云服务器上的 OpenClaw，支持实时聊天和文件传输。

## 项目结构

```
openclaw-chat/
├── server/          # Node.js WebSocket 服务器
│   ├── index.js     # 主入口
│   ├── src/         # 服务模块
│   └── uploads/     # 文件存储
└── client/          # Tauri 客户端
    ├── src/         # React 前端
    └── src-tauri/   # Tauri 配置
```

## 功能特性

- ✅ WebSocket 实时通信
- ✅ 心跳保活机制
- ✅ 自动重连
- ✅ 文件上传/下载
- ✅ 现代 UI 设计
- ✅ Windows 绿色 exe

## 快速开始

### 启动服务器

```bash
cd server
npm install
npm start
```

服务器启动在 `http://localhost:3000`

### 启动客户端（开发模式）

```bash
cd client
npm install
npm run tauri dev
```

### 构建客户端（生产模式）

```bash
cd client
npm run tauri build
```

构建后的 exe 位于 `src-tauri/target/release/`

## 技术栈

- **服务器**: Node.js + Express + WebSocket
- **客户端**: Tauri + React + TypeScript
- **通信**: WebSocket + HTTP

## 开发团队

- OpenClaw + Claude Code (GLM-5)

---

*开发日期: 2026-02-15*
